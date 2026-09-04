import { Router } from "express";
import * as controller from "../../controllers/staff/staff.controller";
import { requireStaff } from "../../middleware/require-staff";

const router = Router();
router.use(requireStaff);

router.get("/dashboard", controller.getDashboard);
router.get("/events", controller.listEvents);
router.get("/events/:id", controller.getEvent);
router.get("/events/:id/attendees", controller.listEventAttendees);
router.get("/attendees", controller.listAttendees);
router.get("/check-in/search", controller.searchCheckIn);
router.post("/registrations/:id/check-in", controller.checkIn);
router.get("/schedule", controller.listSchedule);
router.get("/notifications", controller.listNotifications);
router.patch("/notifications/read-all", controller.readAllNotifications);
router.patch("/notifications/:id/read", controller.readNotification);
router.get("/profile", controller.getProfile);
router.put("/profile", controller.updateProfile);

export default router;
