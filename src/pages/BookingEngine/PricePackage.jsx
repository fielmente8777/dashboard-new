import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import ImageListPicker from "../../components/ui/ImageListPicker";
import PageShell from "../../components/ui/PageShell";
import Tabs from "../../components/ui/Tabs";
import { useConfirm } from "../../context/ConfirmContext";
import { useApiAction } from "../../hooks/useApiAction";
import {
  useCreateMealPackageMutation,
  useDeleteMealPackageMutation,
  useGetMealPackagesQuery,
} from "../../redux/api/bookingEngineApi";
import { selectHid } from "../../redux/slice/UserSlice";
import { fileToBase64 } from "../../utils/file";
import PackageCard from "./components/PackageCard";
import PackageList from "./components/PackageList";
import { MAX_PACKAGE_IMAGES } from "./constants";
import DatePicker from "../../components/ui/DatePicker";

const EMPTY_FORM = { name: "", description: "", price: "", start: "", end: "" };

const STATUSES = {
  current: { label: "Running", tone: "green" },
  upcoming: { label: "Upcoming", tone: "blue" },
  expired: { label: "Expired", tone: "gray" },
};

// where a package is in its life, from its start and end dates
const getStatusKey = (pack, today) => {
  if (pack.planEnd && pack.planEnd < today) return "expired";
  if (pack.planStart && pack.planStart > today) return "upcoming";
  return "current";
};

const PricePackage = () => {
  const hid = useSelector(selectHid);
  const { confirm } = useConfirm();
  const run = useApiAction();
  const packages = useGetMealPackagesQuery(hid, {
    skip: !hid,
    refetchOnMountOrArgChange: true,
  });
  const [createPackage, { isLoading: isCreating }] =
    useCreateMealPackageMutation();
  const [deletePackage] = useDeleteMealPackageMutation();

  const [tab, setTab] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);

  // each package with its status worked out once
  const list = useMemo(() => {
    const today = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD"
    return (packages.data || []).map((pack) => ({
      ...pack,
      statusKey: getStatusKey(pack, today),
    }));
  }, [packages.data]);

  const count = (key) => list.filter((pack) => pack.statusKey === key).length;
  const shown = tab === "all" ? list : list.filter((p) => p.statusKey === tab);
  const setField = (name) => (e) =>
    setForm({ ...form, [name]: e.target.value });
  const hasValidDates = form.start && form.end && form.start <= form.end;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // this endpoint takes the images themselves (base64), not uploaded URLs
    const packageImage = await Promise.all(images.map(fileToBase64));

    const created = await run(
      createPackage({
        hid,
        packageName: form.name.trim(),
        packageDesc: form.description.trim(),
        packagePrice: form.price,
        packageImage,
        planStart: form.start,
        planEnd: form.end,
        isPerRoom: "false",
      }),
      { success: "Package added", error: "Could not add the package." },
    );

    if (created) {
      setForm(EMPTY_FORM);
      setImages([]);
      setTab("all");
    }
  };

  const handleDelete = async (pack) => {
    const confirmed = await confirm(
      `Delete the package "${pack.packageName}"? This cannot be undone.`,
      { title: "Delete package" },
    );
    if (!confirmed) return;

    await run(deletePackage({ hid, planId: pack.planId }), {
      success: "Package deleted",
      error: "Could not delete the package.",
    });
  };

  return (
    <PageShell
      title="Price Packages"
      description="Meal and stay packages guests can add while booking."
      actions={
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "all", label: `All (${list.length})` },
            { value: "current", label: `Running (${count("current")})` },
            { value: "upcoming", label: `Upcoming (${count("upcoming")})` },
            { value: "expired", label: `Expired (${count("expired")})` },
            { value: "add", label: "Add package" },
          ]}
        />
      }
    >
      {tab === "add" ? (
        <Card title="Add package">
          <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <Field label="Package name">
                <Input
                  required
                  value={form.name}
                  onChange={setField("name")}
                  placeholder="e.g. Breakfast included"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  required
                  value={form.description}
                  onChange={setField("description")}
                  placeholder="What the guest gets"
                />
              </Field>
              <Field label="Price (₹)">
                <Input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={setField("price")}
                  placeholder="0"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Start date">
                  <DatePicker
                    value={form.start}
                    max={form.end || undefined}
                    onChange={(start) => setForm({ ...form, start })}
                  />
                </Field>
                <Field label="End date">
                  <DatePicker
                    value={form.end}
                    min={form.start || undefined}
                    onChange={(end) => setForm({ ...form, end })}
                  />
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Field label="Images" as="div">
                <ImageListPicker
                  files={images}
                  onChange={setImages}
                  max={MAX_PACKAGE_IMAGES}
                />
              </Field>
              <div className="mt-auto flex justify-end">
                <Button
                  type="submit"
                  icon={Plus}
                  loading={isCreating}
                  disabled={!hasValidDates}
                >
                  Add package
                </Button>
              </div>
            </div>
          </form>
        </Card>
      ) : (
        <PackageList
          query={packages}
          isEmpty={shown.length === 0}
          emptyTitle={
            tab === "all" ? "No packages yet" : "No packages in this group"
          }
        >
          {shown.map((pack) => (
            <PackageCard
              key={pack.planId}
              title={pack.packageName}
              images={pack.packageImage}
              description={pack.packageDesc}
              price={pack.packagePrice}
              start={pack.planStart}
              end={pack.planEnd}
              status={STATUSES[pack.statusKey]}
              onDelete={() => handleDelete(pack)}
            />
          ))}
        </PackageList>
      )}
    </PageShell>
  );
};

export default PricePackage;
