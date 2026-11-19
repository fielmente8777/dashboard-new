import { ChevronDown, HelpCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import IconButton from "../../components/ui/IconButton";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useConfirm } from "../../context/ConfirmContext";
import { useFaqOperationMutation } from "../../redux/api/cmsApi";
import { useCmsAction } from "./hooks/useCmsAction";
import { useWebsiteData } from "./hooks/useWebsiteData";
import Icon from "../../components/ui/Icon";

const ANSWER_MAX_LENGTH = 500;
const EMPTY_FORM = { question: "", answer: "" };

const Faq = () => {
  const { data, isLoading } = useWebsiteData();
  const { confirm } = useConfirm();
  const runCmsAction = useCmsAction();
  const [addFaq, { isLoading: isAdding }] = useFaqOperationMutation();
  const [removeFaq] = useFaqOperationMutation();
  const [openIndex, setOpenIndex] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const faqs = data?.Faq || [];
  const question = form.question.trim();
  const answer = form.answer.trim();

  const handleAdd = async (e) => {
    e.preventDefault();

    const added = await runCmsAction(
      addFaq({ operation: "append", question, answer, index: 0 }),
      { success: "FAQ added", error: "Could not add the FAQ." },
    );
    if (added) setForm(EMPTY_FORM);
  };

  const handleDelete = async (faq, index) => {
    const confirmed = await confirm(
      `Delete "${faq.Question}"? This cannot be undone.`,
      { title: "Delete FAQ" },
    );
    if (!confirmed) return;

    const removed = await runCmsAction(
      removeFaq({
        operation: "remove",
        question: faq.Question,
        answer: faq.Answer,
        index,
      }),
      { success: "FAQ deleted", error: "Could not delete the FAQ." },
    );
    if (removed) setOpenIndex(null);
  };

  return (
    <PageShell
      title="FAQs"
      description="Questions and answers shown on your website."
    >
      <div className="grid items-start gap-5 lg:grid-cols-3">
        <Card
          title="Frequently asked questions"
          description={isLoading ? "" : `${faqs.length} published`}
          className="lg:col-span-2"
        >
          {isLoading && <Skeleton className="h-64" />}

          {!isLoading && faqs.length === 0 && (
            <EmptyState
              icon={HelpCircle}
              title="No FAQs yet"
              description="Add the first question with the form."
            />
          )}

          {!isLoading && (
            <ul>
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <li
                    key={`${index}-${faq.Question}`}
                    className="border-t border-app-border! first:border-t-0"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="flex min-w-0 flex-1 items-center gap-2 py-3 text-left text-sm font-medium text-app-text"
                      >
                        <Icon icon={ChevronDown} className={`shrink-0 text-app-text-muted transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                        <span className="min-w-0 flex-1">{faq.Question}</span>
                      </button>
                      <IconButton
                        icon={Trash2}
                        label="Delete FAQ"
                        tone="danger"
                        onClick={() => handleDelete(faq, index)}
                      />
                    </div>
                    {isOpen && (
                      <p className="anim-enter whitespace-pre-line pb-4 pl-6 pr-10 text-sm text-app-text-muted">
                        {faq.Answer}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Add FAQ">
          <form onSubmit={handleAdd} className="space-y-4">
            <Field label="Question">
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. What time is check-in?"
              />
            </Field>
            <Field
              label="Answer"
              hint={`${form.answer.length}/${ANSWER_MAX_LENGTH}`}
            >
              <Textarea
                rows={5}
                maxLength={ANSWER_MAX_LENGTH}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Write the answer"
              />
            </Field>
            <Button
              type="submit"
              icon={Plus}
              loading={isAdding}
              disabled={!question || !answer}
              className="w-full"
            >
              Add FAQ
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
};

export default Faq;
