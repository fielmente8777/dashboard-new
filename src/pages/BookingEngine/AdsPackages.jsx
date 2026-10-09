import { Plus } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import ImageListPicker from "../../components/ui/ImageListPicker";
import PageShell from "../../components/ui/PageShell";
import RichTextEditor from "../../components/ui/RichTextEditor";
import Tabs from "../../components/ui/Tabs";
import { useConfirm } from "../../context/ConfirmContext";
import { useApiAction } from "../../hooks/useApiAction";
import { useImageUpload } from "../../hooks/useImageUpload";
import {
  useCreateAdPackageMutation,
  useDeleteAdPackageMutation,
  useGetAdPackagesQuery,
} from "../../redux/api/bookingEngineApi";
import { selectHid } from "../../redux/slice/UserSlice";
import PackageCard from "./components/PackageCard";
import PackageList from "./components/PackageList";
import DatePicker from "../../components/ui/DatePicker";

const EMPTY_FORM = {
  name: "",
  description: "",
  inclusion: "",
  guests: "",
  days: "",
  nights: "",
  price: "",
  start: "",
  end: "",
};

const AdsPackages = () => {
  const hid = useSelector(selectHid);
  const { confirm } = useConfirm();
  const run = useApiAction();
  const { uploadAll } = useImageUpload();
  const packages = useGetAdPackagesQuery(hid, {
    skip: !hid,
    refetchOnMountOrArgChange: true,
  });
  const [createPackage] = useCreateAdPackageMutation();
  const [deletePackage] = useDeleteAdPackageMutation();

  const [tab, setTab] = useState("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [itinerary, setItinerary] = useState("");
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const list = packages.data || [];
  const setField = (name) => (e) =>
    setForm({ ...form, [name]: e.target.value });
  const hasValidDates = form.start && form.end && form.start <= form.end;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const packageImage = await uploadAll(images);
    const created =
      packageImage &&
      (await run(
        createPackage({
          hid,
          packageName: form.name.trim(),
          packageDesc: form.description.trim(),
          packageInclusion: form.inclusion.trim(),
          packageItinerary: itinerary,
          packageguests: form.guests,
          packagePrice: form.price,
          NoofDays: form.days,
          NoofNight: form.nights,
          packageImage,
          packageStart: form.start,
          packageEnd: form.end,
          roomTypeProvided: "1",
        }),
        { success: "Package added", error: "Could not add the package." },
      ));

    setSaving(false);
    if (created) {
      // the form (and its editor) is unmounted with the tab, so it starts empty next time
      setForm(EMPTY_FORM);
      setItinerary("");
      setImages([]);
      setTab("list");
    }
  };

  const handleDelete = async (pack) => {
    const confirmed = await confirm(
      `Delete the package "${pack.packageName}"? This cannot be undone.`,
      { title: "Delete package" },
    );
    if (!confirmed) return;

    await run(deletePackage({ hid, packageId: pack.packageId }), {
      success: "Package deleted",
      error: "Could not delete the package.",
    });
  };

  return (
    <PageShell
      title="Ads Packages"
      description="Holiday packages promoted in your ads and on the booking engine."
      actions={
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "list", label: `Packages (${list.length})` },
            { value: "add", label: "Add package" },
          ]}
        />
      }
    >
      {tab === "add" ? (
        <Card title="Add package">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Package name" className="lg:col-span-2">
                <Input
                  required
                  value={form.name}
                  onChange={setField("name")}
                  placeholder="e.g. Goa Weekend Escape"
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
              <Field label="Guests">
                <Input
                  required
                  type="number"
                  min="1"
                  value={form.guests}
                  onChange={setField("guests")}
                  placeholder="2"
                />
              </Field>
              <Field label="Days">
                <Input
                  required
                  type="number"
                  min="1"
                  value={form.days}
                  onChange={setField("days")}
                  placeholder="3"
                />
              </Field>
              <Field label="Nights">
                <Input
                  required
                  type="number"
                  min="0"
                  value={form.nights}
                  onChange={setField("nights")}
                  placeholder="2"
                />
              </Field>
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

            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Description">
                <Textarea
                  required
                  value={form.description}
                  onChange={setField("description")}
                  placeholder="A short summary of the package"
                />
              </Field>
              <Field label="Inclusions">
                <Textarea
                  required
                  value={form.inclusion}
                  onChange={setField("inclusion")}
                  placeholder="e.g. Breakfast, airport pickup, sightseeing"
                />
              </Field>
            </div>

            <Field label="Itinerary" as="div">
              <RichTextEditor value="" onChange={setItinerary} height={300} />
            </Field>

            <Field label="Images" as="div">
              <ImageListPicker files={images} onChange={setImages} />
            </Field>

            <div className="flex justify-end">
              <Button
                type="submit"
                icon={Plus}
                loading={saving}
                disabled={!hasValidDates}
              >
                Add package
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <PackageList
          query={packages}
          isEmpty={list.length === 0}
          emptyTitle="No ad packages yet"
        >
          {list.map((pack) => (
            <PackageCard
              key={pack.packageId}
              title={pack.packageName}
              images={pack.packageImage}
              description={pack.packageDesc}
              price={pack.packagePrice}
              start={pack.packageStart}
              end={pack.packageEnd}
              onDelete={() => handleDelete(pack)}
            />
          ))}
        </PackageList>
      )}
    </PageShell>
  );
};

export default AdsPackages;
