import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "../../../config/env";

const GoogleSignInButton = ({ onSuccess, onError }) => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          text="continue_with"
          type="standard"
          theme="outline"
          size="large"
          shape="rectangular"
          logo_alignment="center"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleSignInButton;
