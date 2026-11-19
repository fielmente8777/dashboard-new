import CodeBlock from "../../../components/ui/CodeBlock";
import { installScripts } from "../eazbotUtils";

const STEPS = [
  "Copy the code for your kind of website.",
  "Paste it just before the closing </body> tag (or in your root layout for Next.js).",
  "Publish your website. The chat button appears in the bottom-right corner.",
];

const InstallSection = ({ tenant }) => {
  const scripts = installScripts(tenant);

  return (
    <div className="space-y-5">
      <ol className="space-y-2">
        {STEPS.map((step, index) => (
          <li key={index} className="flex gap-3 text-sm text-app-text">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white dark:bg-blue-600">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <CodeBlock title="Any website (HTML, WordPress, Wix…)" code={scripts.html} />
      <CodeBlock title="Next.js" code={scripts.nextjs} />
    </div>
  );
};

export default InstallSection;
