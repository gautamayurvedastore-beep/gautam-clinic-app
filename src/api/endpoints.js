import { apiRequest } from './client';

/* ---------- Auth ---------- */

export const sendOtp = (mobile) =>
  apiRequest('send_otp.php', { method: 'POST', body: { mobile } });

export const verifyOtp = (mobile, otp, deviceId, deviceType) =>
  apiRequest('verify_otp.php', {
    method: 'POST',
    body: { mobile, otp, device_id: deviceId, device_type: deviceType },
  });

export const checkUser = (mobile) =>
  apiRequest('check_user.php', { method: 'POST', body: { mobile } });

export const registerPatient = (payload) =>
  apiRequest('register.php', { method: 'POST', body: payload });

export const logout = () => apiRequest('logout.php', { method: 'POST', auth: true });

/* ---------- Profile ---------- */

export const getProfile = () => apiRequest('profile.php', { method: 'GET', auth: true });

export const updateProfile = (payload) =>
  apiRequest('profile.php', { method: 'POST', auth: true, body: payload });

/* ---------- Branches / Doctors / Slots ---------- */

export const getBranches = () => apiRequest('branches_list.php', { method: 'GET' });

export const getDoctors = (branchId) =>
  apiRequest('doctors_list.php', { method: 'GET', params: { branch_id: branchId } });

export const getAvailableSlots = (branchId, date, doctorId) =>
  apiRequest('available_slots.php', {
    method: 'GET',
    params: { branch_id: branchId, date, doctor_id: doctorId },
  });

/* ---------- Appointments ---------- */

export const getAppointments = (filter = 'upcoming') =>
  apiRequest('appointments_list.php', { method: 'GET', auth: true, params: { filter } });

export const bookAppointment = (payload) =>
  apiRequest('appointment_book.php', { method: 'POST', auth: true, body: payload });

export const cancelAppointment = (appointmentId) =>
  apiRequest('appointment_cancel.php', {
    method: 'POST',
    auth: true,
    body: { appointment_id: appointmentId },
  });

export const rescheduleAppointment = (appointmentId, date, time) =>
  apiRequest('appointment_reschedule.php', {
    method: 'POST',
    auth: true,
    body: { appointment_id: appointmentId, appointment_date: date, appointment_time: time },
  });

/* ---------- Prescriptions ---------- */

export const getPrescriptions = () =>
  apiRequest('prescriptions_list.php', { method: 'GET', auth: true });

export const getPrescriptionDetail = (id) =>
  apiRequest('prescription_detail.php', { method: 'GET', auth: true, params: { id } });
