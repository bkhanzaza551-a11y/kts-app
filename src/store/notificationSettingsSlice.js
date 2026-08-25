import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';

export const fetchNotificationSettings = createAsyncThunk(
  'notificationSettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await client.get('/notification-settings');
      return res.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const toggleNotificationSetting = createAsyncThunk(
  'notificationSettings/toggle',
  async (slug, { dispatch, rejectWithValue }) => {
    try {
      const res = await client.post(`/notification-settings/${slug}/toggle`);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const toggleAllCategory = createAsyncThunk(
  'notificationSettings/toggleAll',
  async ({ category, isEnabled }, { dispatch, rejectWithValue }) => {
    try {
      const res = await client.post('/notification-settings/toggle-all', {
        category,
        is_enabled: isEnabled,
      });
      return { ...res.data, category, isEnabled };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const notificationSettingsSlice = createSlice({
  name: 'notificationSettings',
  initialState: {
    settings: [],
    grouped: {},
    enabledSlugs: [],
    settingsMap: {},
    isLoading: false,
    isToggling: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchNotificationSettings.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(fetchNotificationSettings.fulfilled, (s, a) => {
        s.isLoading = false;
        s.settings = a.payload.data.settings || [];
        s.grouped = a.payload.data.grouped || {};
        s.enabledSlugs = a.payload.data.enabled_slugs || [];
        const map = {};
        (a.payload.data.settings || []).forEach((setting) => {
          map[setting.slug] = setting.is_enabled;
        });
        s.settingsMap = map;
      })
      .addCase(fetchNotificationSettings.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      })
      // Toggle single setting - optimistic update
      .addCase(toggleNotificationSetting.pending, (s, a) => {
        s.isToggling = a.meta.arg;
        // Optimistic update
        const slug = a.meta.arg;
        if (s.settingsMap[slug] !== undefined) {
          s.settingsMap[slug] = !s.settingsMap[slug];
        }
        // Update in settings array
        const setting = s.settings.find((st) => st.slug === slug);
        if (setting) setting.is_enabled = !setting.is_enabled;
        // Update in grouped
        for (const cat of Object.keys(s.grouped)) {
          const items = s.grouped[cat];
          if (Array.isArray(items)) {
            const found = items.find((st) => st.slug === slug);
            if (found) found.is_enabled = !found.is_enabled;
          }
        }
        // Update enabledSlugs
        if (s.settingsMap[slug]) {
          if (!s.enabledSlugs.includes(slug)) s.enabledSlugs.push(slug);
        } else {
          s.enabledSlugs = s.enabledSlugs.filter((s) => s !== slug);
        }
      })
      .addCase(toggleNotificationSetting.fulfilled, (s, a) => {
        s.isToggling = null;
      })
      .addCase(toggleNotificationSetting.rejected, (s, a) => {
        s.isToggling = null;
        // Revert optimistic update on error
        const slug = a.meta.arg;
        if (s.settingsMap[slug] !== undefined) {
          s.settingsMap[slug] = !s.settingsMap[slug];
        }
        const setting = s.settings.find((st) => st.slug === slug);
        if (setting) setting.is_enabled = !setting.is_enabled;
        for (const cat of Object.keys(s.grouped)) {
          const items = s.grouped[cat];
          if (Array.isArray(items)) {
            const found = items.find((st) => st.slug === slug);
            if (found) found.is_enabled = !found.is_enabled;
          }
        }
        if (s.settingsMap[slug]) {
          if (!s.enabledSlugs.includes(slug)) s.enabledSlugs.push(slug);
        } else {
          s.enabledSlugs = s.enabledSlugs.filter((s) => s !== slug);
        }
      })
      // Toggle all in category
      .addCase(toggleAllCategory.pending, (s, a) => {
        const { category, isEnabled } = a.meta.arg;
        const items = s.grouped[category] || [];
        if (Array.isArray(items)) {
          items.forEach((st) => {
            st.is_enabled = isEnabled;
            s.settingsMap[st.slug] = isEnabled;
          });
        }
        s.settings.forEach((st) => {
          if (st.category === category) {
            st.is_enabled = isEnabled;
            s.settingsMap[st.slug] = isEnabled;
          }
        });
        s.enabledSlugs = Object.keys(s.settingsMap).filter((k) => s.settingsMap[k]);
      })
      .addCase(toggleAllCategory.fulfilled, (s, a) => {
        // Already updated optimistically
      })
      .addCase(toggleAllCategory.rejected, (s, a) => {
        // Revert on error - re-fetch
      });
  },
});

export default notificationSettingsSlice.reducer;

// Selector: check if notification is enabled
export const selectIsNotificationEnabled = (state, slug) => {
  const { settingsMap } = state.notificationSettings;
  if (settingsMap[slug] === undefined) return true;
  return settingsMap[slug];
};
