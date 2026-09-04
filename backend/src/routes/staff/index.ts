import { Router } from "express";
import * as controller from "../../controllers/staff/staff.controller";
import { requireStaff } from "../../middleware/require-staff";
import { uploadEventAgenda, uploadEventImage } from "../admin/uploads.routes";

const router = Router();
router.use(requireStaff);

router.get("/dashboard", controller.getDashboard);
router.get("/events", controller.listEvents);
router.get("/events/:id", controller.getEvent);
router.put("/events/:id", controller.updateEvent);
router.get("/events/:id/attendees", controller.listEventAttendees);
router.get("/attendees", controller.listAttendees);
router.get("/check-in/search", controller.searchCheckIn);
router.post("/check-in/verify-ticket", controller.verifyTicket);
router.post("/registrations/:id/check-in", controller.checkIn);
router.patch("/registrations/:id/status", controller.updateRegistration);
router.get("/schedule", controller.listSchedule);
router.post("/schedule", controller.createSchedule);
router.put("/schedule/:id", controller.updateSchedule);
router.delete("/schedule/:id", controller.deleteSchedule);
router.get("/notifications", controller.listNotifications);
router.patch("/notifications/read-all", controller.readAllNotifications);
router.patch("/notifications/:id/read", controller.readNotification);
router.get("/venues", controller.listVenues);
router.post("/uploads/event-image", uploadEventImage);
router.post("/uploads/event-agenda", uploadEventAgenda);
router.get("/profile", controller.getProfile);
router.put("/profile", controller.updateProfile);

export default router;
