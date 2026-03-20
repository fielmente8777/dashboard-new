import { Link } from "react-router-dom";
import CommanHeader from "../../components/Navbar/CommanHeader";

const SocialMedia = () => {
  return (
    <div className="bg-white cardShadow p-4">
      {/* <iframe
        title="Social Media Management"
        src="https://social.eazotel.com/client/eazotel/clientlogin.do"
        width="100%"
        height="600px"
      /> */}
      <CommanHeader serviceName="Social Media Management" />
      <hr className="mt-3" />
      <p className="text-gray-600 mb-4 mt-2">
        Full-scale social media management including posts, stories, reels,
        engagement, and insights tracking.
      </p>
      <ul className="list-disc pl-6 text-gray-600 space-y-1">
        <li>Monthly content calendar</li>
        <li>High-quality graphics & captions</li>
        <li>Engagement & follower growth strategy</li>
      </ul>

      <div className="mt-4">
        <Link
          target="_blank"
          to="https://social.eazotel.com/client/eazotel/clientlogin.do"
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded mt-4"
          rel="noopener noreferrer"
        >
          Redirect to dashboard
        </Link>
      </div>
    </div>
  );
};

export default SocialMedia;
