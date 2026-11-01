import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { notificationRead } from "../../redux/slice/notificationsSlice";
import { dashboardPath } from "../../routes/paths";

// Clicking a notification: mark it read, then go to its page (if it has one).
// `afterOpen` runs before navigating, e.g. to close the panel.
export const useOpenNotification = (afterOpen) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (notification) => {
    dispatch(notificationRead(notification.id));
    afterOpen?.();
    if (notification.link) navigate(dashboardPath(notification.link));
  };
};
