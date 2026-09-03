import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { educationApi } from '../api/education';

export const fetchCourses = createAsyncThunk('education/courses', async (params, { rejectWithValue }) => {
  try { const res = await educationApi.getCourses(params); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchCourseDetail = createAsyncThunk('education/detail', async (id, { rejectWithValue }) => {
  try { const res = await educationApi.getCourseDetail(id); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchCategories = createAsyncThunk('education/categories', async (_, { rejectWithValue }) => {
  try { const res = await educationApi.getCategories(); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

const educationSlice = createSlice({
  name: 'education',
  initialState: { courses: [], currentCourse: null, categories: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (s) => { s.isLoading = true; })
      .addCase(fetchCourses.fulfilled, (s, a) => { s.isLoading = false; s.courses = a.payload.data?.data || a.payload.data; })
      .addCase(fetchCourses.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(fetchCourseDetail.pending, (s) => { s.isLoading = true; })
      .addCase(fetchCourseDetail.fulfilled, (s, a) => { s.isLoading = false; s.currentCourse = a.payload.data; })
      .addCase(fetchCourseDetail.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload.data || []; });
  },
});

export default educationSlice.reducer;
