import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Get token from sessionStorage (unified auth)
    const getToken = () => sessionStorage.getItem('auth_token');

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = getToken();

            if (!token) return;

            const response = await axios.get('http://127.0.0.1:8000/api/user/notifications', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            setNotifications(response.data.data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const token = getToken();

            if (!token) return;

            const response = await axios.get('http://127.0.0.1:8000/api/user/notifications/unread-count', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            const token = getToken();

            if (!token) return;

            await axios.post(`http://127.0.0.1:8000/api/user/notifications/${notificationId}/read`, {}, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update local state
            setNotifications(notifications.map(notif =>
                notif.id === notificationId ? { ...notif, read_at: new Date().toISOString() } : notif
            ));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const token = getToken();

            if (!token) return;

            // Mark each notification as read
            const unreadNotifications = notifications.filter(n => !n.read_at);

            for (const notif of unreadNotifications) {
                await axios.post(`http://127.0.0.1:8000/api/user/notifications/${notif.id}/read`, {}, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            // Update local state
            setNotifications(notifications.map(notif => ({
                ...notif,
                read_at: notif.read_at || new Date().toISOString()
            })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Load notifications on mount
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        // Refresh every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle notification click
    const handleNotificationClick = (notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }

        const data = notification.data;

        // ✅ ADMIN ROUTES
        if (data.type === 'new_custom_order' || data.type === 'payment_uploaded') {
            window.location.href = '/admin/custom-orders';
        }

        // ✅ USER ROUTES
        else if (data.type === 'custom_order_price_updated' ||
            data.type === 'payment_approved' ||
            data.type === 'payment_rejected' ||
            data.type === 'design_rejected') {
            window.location.href = '/user/shop-orders?tab=custom';
        }

        // ✅ PRODUCTION TEAM ROUTES
        else if (data.type === 'order_assigned') {
            window.location.href = '/production-team/assigned-orders';
        }

        setIsOpen(false);
    };

    // Get icon based on notification type (minimal, professional)
    const getNotificationIcon = (type) => {
        const icons = {
            'new_custom_order': '📦',
            'custom_order_price_updated': '💵',
            'payment_uploaded': '💳',
            'payment_approved': '✅',
            'payment_rejected': '❌',
            'design_rejected': '🔄',
            'order_assigned': '👤',
        };
        return icons[type] || '🔔';
    };

    // Format relative time
    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 172800) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread</p>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-[400px]">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                <p className="text-sm text-gray-500 mt-2">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className="text-sm font-medium text-gray-700">No notifications yet</p>
                                <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const icon = getNotificationIcon(notification.data.type);
                                const isUnread = !notification.read_at;

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${isUnread ? 'bg-blue-50/50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-lg">{icon}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-relaxed ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                    {notification.data.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatRelativeTime(notification.created_at)}
                                                </p>
                                            </div>

                                            {/* Unread indicator */}
                                            {isUnread && (
                                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}