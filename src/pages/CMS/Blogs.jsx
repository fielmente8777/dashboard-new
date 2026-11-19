import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import ImagePicker from "../../components/ui/ImagePicker";
import PageShell from "../../components/ui/PageShell";
import RichTextEditor from "../../components/ui/RichTextEditor";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useAddBlogMutation } from "../../redux/api/cmsApi";
import { slugify, stripHtml } from "../../utils/text";
import ContentCard from "./components/ContentCard";
import ContentGrid from "./components/ContentGrid";
import { useCmsAction } from "./hooks/useCmsAction";
import { useWebsiteData } from "./hooks/useWebsiteData";

const Blogs = () => {
  const { data, isLoading } = useWebsiteData();
  const runCmsAction = useCmsAction();
  const { upload, isUploading } = useImageUpload();
  const [addBlog, { isLoading: isAdding }] = useAddBlogMutation();
  const [heading, setHeading] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  // changing the key gives the form a fresh, empty editor
  const [editorKey, setEditorKey] = useState(0);

  const blogs = data?.Blogs || [];
  const slug = slugify(heading);
  const canSubmit = Boolean(slug && image && stripHtml(text).trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imageUrl = await upload(image);
    if (!imageUrl) return;

    const added = await runCmsAction(
      addBlog({
        operation: "append",
        Heading: heading.trim(),
        Slug: slug,
        Text: text,
        Image: imageUrl,
      }),
      { success: "Blog published", error: "Could not add the blog." },
    );

    if (added) {
      setHeading("");
      setText("");
      setImage(null);
      setEditorKey((key) => key + 1);
    }
  };

  return (
    <PageShell title="Blogs" description="Articles published on your website.">
      <ContentGrid
        isLoading={isLoading}
        isEmpty={blogs.length === 0}
        emptyIcon={FileText}
        emptyTitle="No blogs yet"
      >
        {blogs.map((blog, index) => (
          <ContentCard
            key={blog.Slug || index}
            image={blog.Image}
            title={blog.Heading}
          >
            <p className="line-clamp-3">{stripHtml(blog.Text)}</p>
            {blog.link && (
              <a
                href={blog.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-2 text-xs font-medium text-blue-500 hover:underline"
              >
                Read more
              </a>
            )}
          </ContentCard>
        ))}
      </ContentGrid>

      <Card title="Add blog">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <Field label="Heading">
                <Input
                  required
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="Blog heading"
                />
              </Field>
              <Field label="Slug" hint="Created from the heading.">
                <Input disabled readOnly value={slug} placeholder="blog-slug" />
              </Field>
            </div>
            <Field label="Banner image" as="div">
              <ImagePicker file={image} onChange={setImage} className="h-36" />
            </Field>
          </div>

          <Field label="Content" as="div">
            <RichTextEditor key={editorKey} value="" onChange={setText} />
          </Field>

          <div className="flex justify-end">
            <Button
              type="submit"
              icon={Plus}
              loading={isUploading || isAdding}
              disabled={!canSubmit}
            >
              Publish blog
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
};

export default Blogs;
