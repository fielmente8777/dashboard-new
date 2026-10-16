import MediaCard from "../../../components/ui/MediaCard";

// A card for one piece of website content (offer, event, blog post).
const ContentCard = ({ image, ...props }) => (
  <MediaCard images={image ? [image] : []} {...props} />
);

export default ContentCard;
