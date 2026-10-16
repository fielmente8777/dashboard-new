import {
  ArrowLeft,
  FileText,
  FileUp,
  Image as ImageIcon,
  Sparkles,
  X,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field, Input } from "../../../components/ui/Field";
import FileDropZone from "../../../components/ui/FileDropZone";
import PageShell from "../../../components/ui/PageShell";
import { ErrorState } from "../../../components/ui/States";
import Icon from "../../../components/ui/Icon";

const MAX_IMAGES = 8;

// Step 2: the website URL (required) plus an optional PDF and photos to
// build the knowledge base from.
// intake: { url, clientName, file, images: [{ file, previewUrl }] }
const IntakeStep = ({
  intake,
  setIntake,
  generating,
  error,
  onGenerate,
  onBack,
}) => {
  const { url, clientName, file, images } = intake;
  const imagesFull = images.length >= MAX_IMAGES;

  const pickPdf = (files) => {
    const pdf = files.find((f) => f.type === "application/pdf");
    if (pdf) setIntake((prev) => ({ ...prev, file: pdf }));
  };

  const pickImages = (files) => {
    const added = files
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(0, MAX_IMAGES - images.length))
      .map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) }));

    if (added.length > 0) {
      setIntake((prev) => ({ ...prev, images: [...prev.images, ...added] }));
    }
  };

  const removeImage = (image) => {
    URL.revokeObjectURL(image.previewUrl);
    setIntake((prev) => ({
      ...prev,
      images: prev.images.filter((item) => item !== image),
    }));
  };

  return (
    <PageShell
      title="Generate Knowledge Base"
      description="Give us your website link, and optionally a PDF (brochure, tariff sheet, policy doc) and photos. We'll pull everything into a structured knowledge base you can review and edit."
      maxWidth="max-w-2xl"
      actions={
        <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
          Back
        </Button>
      }
    >
      <Card>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onGenerate();
          }}
        >
          <Field label="Website URL">
            <Input
              required
              type="url"
              value={url}
              onChange={(e) =>
                setIntake((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://yourhotel.com"
            />
          </Field>

          <Field label="Client name (optional)">
            <Input
              value={clientName}
              onChange={(e) =>
                setIntake((prev) => ({ ...prev, clientName: e.target.value }))
              }
              placeholder="e.g. Sea View Resort"
            />
          </Field>

          <Field label="PDF (optional)" as="div">
            {file ? (
              <div className="flex items-center gap-2 rounded-lg border border-app-border! px-3 py-2.5 text-sm text-app-text">
                <Icon icon={FileText} className="shrink-0 text-orange-500" />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <button
                  type="button"
                  aria-label="Remove PDF"
                  onClick={() => setIntake((prev) => ({ ...prev, file: null }))}
                  className="rounded p-0.5 text-app-text-muted hover:text-red-500"
                >
                  <Icon icon={X} size="sm" />
                </button>
              </div>
            ) : (
              <FileDropZone accept="application/pdf" onFiles={pickPdf}>
                <Icon icon={FileUp} size="xl" className="text-app-text-faint" />
                <p className="text-sm text-app-text-muted">
                  Drop a PDF here, or{" "}
                  <span className="text-blue-500">browse</span>
                </p>
              </FileDropZone>
            )}
          </Field>

          <Field
            label={`Images (optional) · ${images.length}/${MAX_IMAGES}`}
            as="div"
          >
            <FileDropZone
              accept="image/*"
              multiple
              disabled={imagesFull}
              onFiles={pickImages}
            >
              <Icon icon={ImageIcon} size="xl" className="text-app-text-faint" />
              <p className="text-sm text-app-text-muted">
                {imagesFull ? (
                  "Maximum images reached"
                ) : (
                  <>
                    Drop images here, or{" "}
                    <span className="text-blue-500">browse</span>
                  </>
                )}
              </p>
              <p className="text-xs text-app-text-faint">
                Property photos, room shots, menu images, logos — JPG, PNG or
                WEBP
              </p>
            </FileDropZone>

            {images.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {images.map((image) => (
                  <div
                    key={image.previewUrl}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-app-surface-secondary"
                  >
                    <img
                      src={image.previewUrl}
                      alt={image.file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${image.file.name}`}
                      title="Remove"
                      onClick={() => removeImage(image)}
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white transition-colors hover:bg-red-600 sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100"
                    >
                      <Icon icon={X} size="xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          {error && <ErrorState message={error} />}

          <Button
            type="submit"
            size="lg"
            icon={Sparkles}
            loading={generating}
            disabled={!url.trim()}
            className="w-full"
          >
            {generating
              ? "Generating knowledge base... this can take a few minutes"
              : "Generate knowledge base"}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
};

export default IntakeStep;
