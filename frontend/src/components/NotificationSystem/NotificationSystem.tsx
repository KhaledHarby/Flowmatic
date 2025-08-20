import React, { useEffect } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { removeNotification } from '../../store/slices/uiSlice';

const NotificationSystem: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.ui);

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  const getCurrentNotification = () => {
    return notifications.length > 0 ? notifications[0] : null;
  };

  const currentNotification = getCurrentNotification();

  useEffect(() => {
    if (currentNotification && currentNotification.duration) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(currentNotification.id));
      }, currentNotification.duration);

      return () => clearTimeout(timer);
    }
  }, [currentNotification, dispatch]);

  if (!currentNotification) {
    return null;
  }

  return (
    <Snackbar
      open={true}
      autoHideDuration={currentNotification.duration || 6000}
      onClose={() => handleClose(currentNotification.id)}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={() => handleClose(currentNotification.id)}
        severity={currentNotification.type as AlertColor}
        sx={{ width: '100%' }}
      >
        {currentNotification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSystem;
