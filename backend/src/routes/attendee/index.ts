import { Router } from "express";
import * as controller from "../../controllers/attendee/attendee.controller";
import { requireAttendee } from "../../middleware/require-attendee";

const router = Router();
router.use(requireAttendee);

router.get("/dashboard", controller.getDashboard);
router.get("/events", controller.listEvents);
router.get("/events/available", controller.listAvailableEvents);
router.post("/events/:id/register", controller.registerForEvent);
router.get("/registrations", controller.listRegistrations);
router.patch("/registrations/:id/cancel", controller.cancelRegistration);
router.get("/tickets", controller.listTickets);
router.get("/notifications", controller.listNotifications);
router.patch("/notifications/read-all", controller.readAllNotifications);
router.patch("/notifications/:id/read", controller.readNotification);
router.get("/profile", controller.getProfile);
router.put("/profile", controller.updateProfile);

export default router;
