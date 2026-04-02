import { LocalNotifications } from '@capacitor/local-notifications';
import { useStore } from '../store/useStore';

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  private constructor() { }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize the notification system and sync with current settings
   */
  public async init() {
    if (this.isInitialized) return;
    
    try {
      this.isInitialized = true;
      const { notificationsEnabled } = useStore.getState();

      // Always check permissions on init
      const status = await LocalNotifications.checkPermissions();

      if (notificationsEnabled) {
        if (status.display !== 'granted') {
          await this.requestPermissions();
        }
        await this.updateSchedule();
      } else {
        await this.cancelAll();
      }
    } catch (error) {
      console.warn('NotificationService init failed:', error);
    }
  }

  /**
   * Request all necessary permissions for notifications and exact alarms
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  /**
   * Update the scheduled notification based on current store settings
   */
  public async updateSchedule() {
    const { notificationsEnabled, notificationTime } = useStore.getState();

    // 1. Clear existing notifications
    await this.cancelAll();

    if (!notificationsEnabled) return;

    // 2. Parse time (format: "HH:mm")
    const [hours, minutes] = notificationTime.split(':').map(Number);

    try {
      // 3. Schedule the recurring daily notification
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: '🌱خذ نفساً عميقاً.. حان وقت الذكر',
            body: 'نور قلبك بورد القرآن، وأفضل الأذكار، خطوات بسيطة لأجرٍ وسكينة لا تنتهي.',
            schedule: {
              on: {
                hour: hours,
                minute: minutes
              },
              repeats: true,
              allowWhileIdle: true,
              // @ts-ignore - 'exact' is supported in later versions of the plugin/android
              exact: true
            },
            sound: 'default',
            actionTypeId: '',
            extra: null
          }
        ]
      });
      console.log(`Notification scheduled for ${notificationTime} daily.`);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  public async cancelAll() {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map(n => ({ id: n.id }))
        });
      }
    } catch (error) {
      console.warn('Failed to cancel notifications:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();
