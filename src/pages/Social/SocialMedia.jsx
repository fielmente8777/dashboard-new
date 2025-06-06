import CommanHeader from "../../components/Navbar/CommanHeader";

const SocialMedia = () => {
  return (
    <div className="p-4 bg-white">
      <CommanHeader serviceName="Social Media Management" />
      <hr className="mt-3" />
      <p className="text-gray-600 mb-4 mt-2">
        Full-scale social media management including posts, stories, reels, engagement, and insights tracking.
      </p>
      <ul className="list-disc pl-6 text-gray-600 space-y-1">
        <li>Monthly content calendar</li>
        <li>High-quality graphics & captions</li>
        <li>Engagement & follower growth strategy</li>
      </ul>
    </div>
  );
};

export default SocialMedia;
