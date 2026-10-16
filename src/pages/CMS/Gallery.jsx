import { Images, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, Skeleton } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useGalleryImageOperationMutation } from "../../redux/api/cmsApi";
import { useCmsAction } from "./hooks/useCmsAction";
import { useWebsiteData } from "./hooks/useWebsiteData";
import Icon from "../../components/ui/Icon";

const Gallery = () => {
  const fileInputRef = useRef(null);
  const { data, isLoading } = useWebsiteData();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const runCmsAction = useCmsAction();
  const { upload } = useImageUpload();
  const [changeImage] = useGalleryImageOperationMutation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // stored as [{ Category, Images: [url] }]
  const gallery = data?.Gallery || [];
  const categories = [...new Set(gallery.map((group) => group.Category))];
  // falls back to the first category until one is picked (or if it disappears)
  const category = categories.includes(selectedCategory)
    ? selectedCategory
    : categories[0];
  const images = gallery
    .filter((group) => group.Category === category)
    .flatMap((group) => group.Images || []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setIsUploading(true);
    let added = 0;

    // one at a time: every call rewrites the same category on the server
    for (const file of files) {
      const imageurl = await upload(file);
      if (!imageurl) break;

      const saved = await runCmsAction(
        changeImage({ operation: "append", category, imageurl }),
        { error: "Could not add the image to the gallery." },
      );
      if (!saved) break;
      added += 1;
    }

    setIsUploading(false);
    // failures already showed their own message
    if (added > 0) {
      showToast({
        message: added === 1 ? "Image added" : `${added} images added`,
      });
    }
  };

  const handleDelete = async (imageurl) => {
    const confirmed = await confirm(
      "Delete this image from the gallery? This cannot be undone.",
      { title: "Delete image" },
    );
    if (!confirmed) return;

    await runCmsAction(changeImage({ operation: "remove", category, imageurl }), {
      success: "Image deleted",
      error: "Could not delete the image.",
    });
  };

  return (
    <PageShell
      title="Gallery"
      description="Photos shown on your website, grouped by category."
      actions={
        <>
          <Button
            icon={Upload}
            loading={isUploading}
            disabled={!category}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload images
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </>
      }
    >
      <Card>
        {isLoading && <Skeleton className="h-72" />}

        {!isLoading && categories.length === 0 && (
          <EmptyState
            icon={Images}
            title="No gallery categories yet"
            description="Categories are created with your website. Contact support to add one."
          />
        )}

        {!isLoading && categories.length > 0 && (
          <>
            <Tabs
              className="mb-4"
              value={category}
              onChange={setSelectedCategory}
              tabs={categories.map((name) => ({ value: name, label: name }))}
            />

            {images.length === 0 ? (
              <EmptyState
                icon={Images}
                title={`No images in ${category}`}
                description="Use Upload images to add some."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {images.map((url) => (
                  <figure
                    key={url}
                    className="group relative aspect-4/3 overflow-hidden rounded-lg bg-app-surface-secondary"
                  >
                    <img
                      src={url}
                      alt={category}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Delete image"
                      title="Delete image"
                      onClick={() => handleDelete(url)}
                      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600 sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100"
                    >
                      <Icon icon={Trash2} />
                    </button>
                  </figure>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </PageShell>
  );
};

export default Gallery;
