import { ImageOff, Save, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import PageShell from "../../components/ui/PageShell";
import { Skeleton } from "../../components/ui/States";
import { useImageUpload } from "../../hooks/useImageUpload";
import {
  useSaveFooterMutation,
  useSaveSocialLinksMutation,
  useSaveTrackingCodesMutation,
} from "../../redux/api/cmsApi";
import { useCmsAction } from "./hooks/useCmsAction";
import { useWebsiteData } from "./hooks/useWebsiteData";
import Icon from "../../components/ui/Icon";

// `key` is the field name in the website data
const CONTACT_FIELDS = [
  { key: "Phone", label: "Phone" },
  { key: "WhatsApp", label: "WhatsApp number" },
  { key: "Email", label: "Email" },
  { key: "City", label: "City" },
  { key: "Address", label: "Address", multiline: true },
  { key: "AboutText", label: "About text", multiline: true },
  { key: "NewsLetterText", label: "Newsletter text", multiline: true },
];

const SOCIAL_FIELDS = [
  { key: "Facebook", label: "Facebook" },
  { key: "Instagram", label: "Instagram" },
  { key: "Linkedin", label: "LinkedIn" },
  { key: "Youtube", label: "YouTube" },
  { key: "Twitter", label: "Twitter" },
  { key: "Tripadvisors", label: "Tripadvisor" },
];

const TRACKING_FIELDS = [
  { key: "TagManager", label: "Google Tag Manager" },
  { key: "Analytics", label: "Google Analytics" },
  { key: "Console", label: "Google Search Console" },
  { key: "Pixel", label: "Facebook Pixel" },
  { key: "Clarity", label: "Microsoft Clarity" },
  { key: "Pagespeed", label: "PageSpeed Insights" },
];

const FieldList = ({ fields, values, onChange, placeholder }) => (
  <div className="space-y-4">
    {fields.map(({ key, label, multiline }) => {
      const Control = multiline ? Textarea : Input;

      return (
        <Field key={key} label={label}>
          <Control
            value={values[key] ?? ""}
            onChange={(e) => onChange({ ...values, [key]: e.target.value })}
            placeholder={placeholder ? placeholder(label) : `Enter ${label.toLowerCase()}`}
          />
        </Field>
      );
    })}
  </div>
);

const Profile = () => {
  const logoInputRef = useRef(null);
  const { data, isLoading } = useWebsiteData();
  const runCmsAction = useCmsAction();
  const { upload, isUploading } = useImageUpload();
  const [saveFooter, footerState] = useSaveFooterMutation();
  const [saveSocialLinks, linksState] = useSaveSocialLinksMutation();
  const [saveTrackingCodes, codesState] = useSaveTrackingCodesMutation();
  const [footer, setFooter] = useState({});
  const [links, setLinks] = useState({});
  const [codes, setCodes] = useState({});

  const isSaving =
    footerState.isLoading || linksState.isLoading || codesState.isLoading;

  // load the saved values into the form (again after every save or location switch)
  useEffect(() => {
    setFooter({ ...data?.Footer });
    setLinks({ ...data?.Links });
    setCodes({ ...data?.Reviews });
  }, [data]);

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const logoUrl = await upload(file);
    if (logoUrl) setFooter((prev) => ({ ...prev, Logo: logoUrl }));
  };

  const handleSave = () =>
    runCmsAction(
      [
        saveSocialLinks({
          Facebook: links.Facebook,
          Instagram: links.Instagram,
          Twitter: links.Twitter,
          Youtube: links.Youtube,
          Linkedin: links.Linkedin,
          Tripadvisors: links.Tripadvisors,
        }),
        saveFooter({
          Address: footer.Address,
          Phone: footer.Phone,
          WhatsApp: footer.WhatsApp,
          NewsLetterText: footer.NewsLetterText,
          city: footer.City,
          email: footer.Email,
          Abouttext: footer.AboutText,
          logo: footer.Logo,
        }),
        saveTrackingCodes({
          Clarity: codes.Clarity,
          TagManager: codes.TagManager,
          Console: codes.Console,
          Pixel: codes.Pixel,
          Analytics: codes.Analytics,
          Pagespeed: codes.Pagespeed,
        }),
      ],
      { success: "Profile updated", error: "Could not update the profile." },
    );

  const hasUnsavedLogo = footer.Logo !== data?.Footer?.Logo;

  return (
    <PageShell
      title="Profile and Links"
      description="Contact details, social links and tracking codes used across your website."
      actions={
        <Button
          icon={Save}
          loading={isSaving}
          disabled={isLoading || isUploading}
          onClick={handleSave}
        >
          Save changes
        </Button>
      }
    >
      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <Card title="Logo">
              <div className="flex items-center gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-app-border! bg-app-surface-secondary">
                  {footer.Logo ? (
                    <img
                      src={footer.Logo}
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Icon icon={ImageOff} size="xl" className="text-app-text-faint" />
                  )}
                </div>
                <div>
                  <Button
                    variant="secondary"
                    icon={Upload}
                    loading={isUploading}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    Change logo
                  </Button>
                  <p className="mt-1.5 text-xs text-app-text-muted">
                    {hasUnsavedLogo
                      ? "New logo uploaded. Save changes to apply it."
                      : "PNG or JPG with a transparent or white background."}
                  </p>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
              </div>
            </Card>

            <Card title="Contact details">
              <FieldList
                fields={CONTACT_FIELDS}
                values={footer}
                onChange={setFooter}
              />
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="Social links">
              <FieldList
                fields={SOCIAL_FIELDS}
                values={links}
                onChange={setLinks}
                placeholder={(label) => `https://www.${label.toLowerCase()}.com/`}
              />
            </Card>

            <Card
              title="Tracking codes"
              description="IDs of the analytics tools connected to your website."
            >
              <FieldList
                fields={TRACKING_FIELDS}
                values={codes}
                onChange={setCodes}
              />
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default Profile;
