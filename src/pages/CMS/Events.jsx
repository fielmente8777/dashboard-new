import { CalendarDays, Clock, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import ImagePicker from "../../components/ui/ImagePicker";
import PageShell from "../../components/ui/PageShell";
import { useConfirm } from "../../context/ConfirmContext";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useEventOperationMutation } from "../../redux/api/cmsApi";
import ContentCard from "./components/ContentCard";
import ContentGrid from "./components/ContentGrid";
import { useCmsAction } from "./hooks/useCmsAction";
import { useWebsiteData } from "./hooks/useWebsiteData";
import { formatDate } from "./utils";
import Icon from "../../components/ui/Icon";
import DatePicker from "../../components/ui/DatePicker";

const EMPTY_FORM = {
  heading: "",
  text: "",
  date: "",
  time: "",
  location: "",
  bookingUrl: "",
};

const Events = () => {
  const { data, isLoading } = useWebsiteData();
  const { confirm } = useConfirm();
  const runCmsAction = useCmsAction();
  const { upload, isUploading } = useImageUpload();
  const [addEvent, { isLoading: isAdding }] = useEventOperationMutation();
  const [removeEvent] = useEventOperationMutation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);

  const events = data?.Events || [];
  const setField = (name) => (e) =>
    setForm({ ...form, [name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imageUrl = await upload(image);
    if (!imageUrl) return;

    const added = await runCmsAction(
      addEvent({
        operation: "append",
        Heading: form.heading,
        Text: form.text,
        Image: imageUrl,
        Date: form.date,
        Time: form.time,
        Location: form.location,
        BookingUrl: form.bookingUrl,
      }),
      { success: "Event added", error: "Could not add the event." },
    );

    if (added) {
      setForm(EMPTY_FORM);
      setImage(null);
    }
  };

  const handleDelete = async (event, index) => {
    const confirmed = await confirm(
      `Delete "${event.Heading}"? This cannot be undone.`,
      { title: "Delete event" },
    );
    if (!confirmed) return;

    await runCmsAction(removeEvent({ operation: "pop", index }), {
      success: "Event deleted",
      error: "Could not delete the event.",
    });
  };

  return (
    <PageShell
      title="Events"
      description="Upcoming events shown on your website."
    >
      <ContentGrid
        isLoading={isLoading}
        isEmpty={events.length === 0}
        emptyIcon={CalendarDays}
        emptyTitle="No events yet"
      >
        {events.map((event, index) => {
          // older events were saved with lowercase keys
          const date = event.Date || event.date;
          const time = event.Time || event.time;
          const location = event.Location || event.location;

          return (
            <ContentCard
              key={`${index}-${event.Heading}`}
              image={event.Image}
              title={event.Heading}
              onDelete={() => handleDelete(event, index)}
            >
              <p>{event.Text}</p>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs">
                {date && (
                  <span className="flex items-center gap-1">
                    <Icon icon={CalendarDays} size="sm" /> {formatDate(date)}
                  </span>
                )}
                {time && (
                  <span className="flex items-center gap-1">
                    <Icon icon={Clock} size="sm" /> {time}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1">
                    <Icon icon={MapPin} size="sm" /> {location}
                  </span>
                )}
              </div>
            </ContentCard>
          );
        })}
      </ContentGrid>

      <Card title="Add event">
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <Field label="Banner image" as="div" className="lg:row-span-3">
            <ImagePicker file={image} onChange={setImage} className="h-52" />
          </Field>

          <Field label="Event title">
            <Input
              required
              value={form.heading}
              onChange={setField("heading")}
              placeholder="e.g. New Year Gala Dinner"
            />
          </Field>
          <Field label="Location">
            <Input
              required
              value={form.location}
              onChange={setField("location")}
              placeholder="e.g. Poolside lawn"
            />
          </Field>
          <Field label="Date">
            <DatePicker
              value={form.date}
              onChange={(date) => setForm({ ...form, date })}
            />
          </Field>
          <Field label="Time">
            <DatePicker
              mode="time"
              value={form.time}
              onChange={(time) => setForm({ ...form, time })}
            />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <Textarea
              required
              rows={2}
              value={form.text}
              onChange={setField("text")}
              placeholder="What is the event about?"
            />
          </Field>
          <Field label="Booking link (optional)" className="md:col-span-2">
            <Input
              type="url"
              value={form.bookingUrl}
              onChange={setField("bookingUrl")}
              placeholder="https://"
            />
          </Field>

          <div className="flex items-end justify-end">
            <Button
              type="submit"
              icon={Plus}
              loading={isUploading || isAdding}
              disabled={!image || !form.date || !form.time}
            >
              Add event
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
};

export default Events;
