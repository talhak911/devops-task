import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  alpha,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  DoneAll as DoneAllIcon, 
  NotificationsNoneOutlined as EmptyIcon,
  FiberManualRecord as UnreadIcon,
  ExpandMore as LoadMoreIcon
} from '@mui/icons-material';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { notifications, unreadCount, loading, hasMore, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: any) => {
    if (isAuthenticated && !notification.isRead) {
      await markAsRead(notification._id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
    
    handleClose();
  };

  return (
    <>
      <Tooltip title={isAuthenticated ? "Notifications" : "Public Alerts"}>
        <IconButton 
          onClick={handleOpen}
          sx={{ 
            color: "text.primary",
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.1)', bgcolor: alpha('#1B1D1D', 0.05) }
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="primary"
            sx={{ 
              "& .MuiBadge-badge": { 
                fontFamily: 'Montserrat', 
                fontWeight: 700, 
                fontSize: '10px' 
              } 
            }}
          >
            <NotificationsIcon sx={{ fontSize: '24px' }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { 
            width: 380, 
            maxHeight: 520, 
            mt: 1.5,
            borderRadius: 0,
            overflowX: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid',
            borderColor: 'var(--color-outline)',
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 24,
              width: 10,
              height: 10,
              bgcolor: 'background.default',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '18px' }}>
            {isAuthenticated ? 'Notifications' : 'Recent Alerts'}
          </Typography>
          {isAuthenticated && unreadCount > 0 && (
            <Button 
              size="small" 
              startIcon={<DoneAllIcon sx={{ fontSize: '16px' }} />}
              onClick={markAllAsRead}
              sx={{ 
                fontFamily: 'Montserrat', 
                fontSize: '12px', 
                fontWeight: 600,
                textTransform: 'none',
                color: 'primary.main',
                '&:hover': { bgcolor: alpha('#BC575F', 0.1) }
              }}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider sx={{ borderColor: 'var(--color-outline)' }} />

        <List sx={{ p: 0 }}>
          {notifications.length === 0 && !loading ? (
            <Box sx={{ p: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <EmptyIcon sx={{ fontSize: 48, color: 'var(--color-outline)' }} />
              <Typography sx={{ fontFamily: 'Montserrat', color: 'text.secondary', fontSize: '14px' }}>
                All caught up! No alerts found.
              </Typography>
            </Box>
          ) : (
            <>
              {notifications.map((notification) => (
                <ListItem
                  key={notification._id}
                  alignItems="flex-start"
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    cursor: 'pointer',
                    p: '16px 24px',
                    bgcolor: (isAuthenticated && notification.isRead) || !isAuthenticated ? 'transparent' : alpha('#BC575F', 0.05),
                    transition: 'all 0.2s',
                    borderBottom: '1px solid',
                    borderColor: alpha('#E7DECE', 0.5),
                    position: 'relative',
                    '&:hover': { bgcolor: alpha('#E7DECE', 0.3) },
                  }}
                >
                  {isAuthenticated && !notification.isRead && (
                    <UnreadIcon color="primary" sx={{ position: 'absolute', right: 16, top: 20, fontSize: '10px' }} />
                  )}
                  <ListItemAvatar sx={{ minWidth: 56 }}>
                    <Avatar 
                      src={notification.actorId?.avatar} 
                      alt={notification.actorId?.name}
                      sx={{ width: 44, height: 44, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    >
                      {notification.actorId?.name?.[0] || 'G'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                        <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '14px', color: 'text.primary', mb: 0.5 }}>
                          {notification.title}
                        </Typography>
                        {notification.recipientId === null && (
                          <Typography variant="caption" sx={{ bgcolor: alpha('#BC575F', 0.1), color: 'primary.main', px: 1, borderRadius: 1, fontSize: '9px', fontWeight: 700 }}>
                            GLOBAL
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box component="span">
                        <Typography 
                          component="span" 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'Montserrat', 
                            fontSize: '13px', 
                            color: 'text.secondary', 
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: 'Montserrat', 
                            display: 'block', 
                            color: 'var(--color-outline)', 
                            fontSize: '11px', 
                            mt: 1,
                            fontWeight: 500
                          }}
                        >
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              
              {hasMore && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button 
                    fullWidth 
                    size="medium"
                    onClick={() => fetchNotifications(false)}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : <LoadMoreIcon />}
                    sx={{ fontFamily: 'Montserrat', fontSize: '13px', fontWeight: 600, color: 'text.secondary' }}
                  >
                    {loading ? 'Loading...' : 'Load more history'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </List>
      </Menu>
    </>
  );
};

export default NotificationBell;
