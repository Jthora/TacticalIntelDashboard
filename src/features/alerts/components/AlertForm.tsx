import './AlertForm.css';

import React, { useState } from 'react';

import { AlertConfig, AlertPriority } from '../../../types/AlertTypes';

interface AlertFormProps {
  initialAlert?: AlertConfig;
  onSubmit: (alert: Omit<AlertConfig, 'id' | 'createdAt' | 'triggerCount'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const AlertForm: React.FC<AlertFormProps> = ({
  initialAlert,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    name: initialAlert?.name || '',
    description: initialAlert?.description || '',
    keywords: initialAlert?.keywords.join(', ') || '',
    sources: initialAlert?.sources?.join(', ') || '',
    priority: initialAlert?.priority || 'medium' as AlertPriority,
    active: initialAlert?.active !== undefined ? initialAlert.active : true,
    
    // Notification settings
    browserNotifications: initialAlert?.notifications.browser !== undefined ? initialAlert.notifications.browser : true,
    soundNotifications: initialAlert?.notifications.sound !== undefined ? initialAlert.notifications.sound : true,
    soundFile: initialAlert?.notifications.soundFile || '',
    email: initialAlert?.notifications.email || '',
    webhook: initialAlert?.notifications.webhook || '',
    customMessage: initialAlert?.notifications.customMessage || '',
    
    // Scheduling
    hasActiveHours: !!initialAlert?.scheduling.activeHours,
    startTime: initialAlert?.scheduling.activeHours?.start || '09:00',
    endTime: initialAlert?.scheduling.activeHours?.end || '17:00',
    activeDays: initialAlert?.scheduling.activeDays || [1, 2, 3, 4, 5], // Mon-Fri by default
    timezone: initialAlert?.scheduling.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Alert name is required';
    }

    if (!formData.keywords.trim()) {
      newErrors.keywords = 'At least one keyword is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.webhook && !/^https?:\/\/.+/.test(formData.webhook)) {
      newErrors.webhook = 'Webhook must be a valid URL';
    }

    if (formData.hasActiveHours) {
      if (formData.startTime >= formData.endTime) {
        newErrors.timeRange = 'Start time must be before end time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const alertData: Omit<AlertConfig, 'id' | 'createdAt' | 'triggerCount'> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      sources: formData.sources ? formData.sources.split(',').map(s => s.trim()).filter(s => s) : undefined,
      priority: formData.priority,
      active: formData.active,
      lastTriggered: initialAlert?.lastTriggered,
      
      notifications: {
        browser: formData.browserNotifications,
        sound: formData.soundNotifications,
        soundFile: formData.soundFile || undefined,
        email: formData.email || undefined,
        webhook: formData.webhook || undefined,
        customMessage: formData.customMessage || undefined
      },
      
      scheduling: {
        activeHours: formData.hasActiveHours ? {
          start: formData.startTime,
          end: formData.endTime
        } : undefined,
        activeDays: formData.activeDays.length > 0 ? formData.activeDays : undefined,
        timezone: formData.timezone
      }
    };

    onSubmit(alertData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    const newActiveDays = formData.activeDays.includes(dayIndex)
      ? formData.activeDays.filter(d => d !== dayIndex)
      : [...formData.activeDays, dayIndex];
    
    handleInputChange('activeDays', newActiveDays.sort());
  };

  return (
    <div className="alert-form">
      <div className="alert-form-header">
        <h3>{isEditing ? 'Edit Alert' : 'Create New Alert'}</h3>
        <p>Configure keyword-based monitoring for your intelligence feeds</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4>Basic Information</h4>
          
          <div className="form-group">
            <label htmlFor="name">Alert Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Security Threats, Market Updates"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description of what this alert monitors"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="keywords">Keywords *</label>
            <textarea
              id="keywords"
              value={formData.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              placeholder="security, threat, vulnerability, attack (comma-separated)"
              rows={3}
              className={errors.keywords ? 'error' : ''}
            />
            {errors.keywords && <span className="error-message">{errors.keywords}</span>}
            <small>Supports boolean operators: "cybersecurity and threats", "malware or virus", "not false positive"</small>
          </div>

          <div className="form-group">
            <label htmlFor="sources">Sources (Optional)</label>
            <input
              id="sources"
              type="text"
              value={formData.sources}
              onChange={(e) => handleInputChange('sources', e.target.value)}
              placeholder="CNN, BBC News, Reuters (leave empty for all sources)"
            />
            <small>Comma-separated list. Leave empty to monitor all sources.</small>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority Level</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value as AlertPriority)}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h4>Notification Settings</h4>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.browserNotifications}
                onChange={(e) => handleInputChange('browserNotifications', e.target.checked)}
              />
              <span className="checkbox-label">🖥️ Browser Notifications</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.soundNotifications}
                onChange={(e) => handleInputChange('soundNotifications', e.target.checked)}
              />
              <span className="checkbox-label">🔊 Sound Alerts</span>
            </label>
          </div>

          {formData.soundNotifications && (
            <div className="form-group">
              <label htmlFor="soundFile">Custom Sound File (Optional)</label>
              <input
                id="soundFile"
                type="url"
                value={formData.soundFile}
                onChange={(e) => handleInputChange('soundFile', e.target.value)}
                placeholder="https://example.com/alert-sound.mp3"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Notifications (Optional)</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your-email@example.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="webhook">Webhook URL (Optional)</label>
            <input
              id="webhook"
              type="url"
              value={formData.webhook}
              onChange={(e) => handleInputChange('webhook', e.target.value)}
              placeholder="https://your-webhook.com/alerts"
              className={errors.webhook ? 'error' : ''}
            />
            {errors.webhook && <span className="error-message">{errors.webhook}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="customMessage">Custom Message Template (Optional)</label>
            <textarea
              id="customMessage"
              value={formData.customMessage}
              onChange={(e) => handleInputChange('customMessage', e.target.value)}
              placeholder="Alert: {{title}} - {{keywords}}"
              rows={2}
            />
            <small>Available variables: {'{title}'}, {'{description}'}, {'{source}'}, {'{keywords}'}</small>
          </div>
        </div>

        <div className="form-section">
          <h4>Scheduling</h4>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.hasActiveHours}
                onChange={(e) => handleInputChange('hasActiveHours', e.target.checked)}
              />
              <span className="checkbox-label">⏰ Limit to specific hours</span>
            </label>
          </div>

          {formData.hasActiveHours && (
            <div className="time-range">
              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>
              {errors.timeRange && <span className="error-message">{errors.timeRange}</span>}
            </div>
          )}

          <div className="form-group">
            <label>Active Days</label>
            <div className="day-selector">
              {dayNames.map((day, index) => (
                <label key={index} className="day-option">
                  <input
                    type="checkbox"
                    checked={formData.activeDays.includes(index)}
                    onChange={() => handleDayToggle(index)}
                  />
                  <span className="day-label">{day.substr(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
              />
              <span className="checkbox-label">✅ Enable this alert immediately</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {isEditing ? 'Update Alert' : 'Create Alert'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlertForm;
