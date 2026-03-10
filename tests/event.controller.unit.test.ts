const serviceMock = {
  createEvent: jest.fn(),
  getEventById: jest.fn(),
  getAllEvents: jest.fn(),
  getUserEvents: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  joinEvent: jest.fn(),
  leaveEvent: jest.fn(),
  respondToBudgetProposal: jest.fn(),
  getBudgetNegotiationHistory: jest.fn(),
};

jest.mock("../src/services/admin/event.service", () => ({
  EventService: jest.fn().mockImplementation(() => serviceMock),
}));

import { EventController } from "../src/controllers/event.controller";

type Req = any;
type Res = any;

const makeRes = (): Res => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("EventController unit", () => {
  const controller = new EventController();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createEvent returns 201 on success", async () => {
    const req: Req = { body: { title: "E" }, userId: "u1" };
    const res = makeRes();
    serviceMock.createEvent.mockResolvedValue({ _id: "e1", title: "E" });

    await controller.createEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(serviceMock.createEvent).toHaveBeenCalledWith(req.body, "u1");
  });

  it("createEvent returns error status on failure", async () => {
    const req: Req = { body: {}, userId: "u1" };
    const res = makeRes();
    serviceMock.createEvent.mockRejectedValue({ statusCode: 400, message: "bad" });

    await controller.createEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getEvent returns 404 when not found", async () => {
    const req: Req = { params: { eventId: "e1" } };
    const res = makeRes();
    serviceMock.getEventById.mockResolvedValue(null);

    await controller.getEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("getEvent returns 200 when found", async () => {
    const req: Req = { params: { eventId: "e1" } };
    const res = makeRes();
    serviceMock.getEventById.mockResolvedValue({ _id: "e1" });

    await controller.getEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("getAllEvents forwards query filters", async () => {
    const req: Req = { query: { category: "music", search: "fest", startDate: "2026-01-01" } };
    const res = makeRes();
    serviceMock.getAllEvents.mockResolvedValue([]);

    await controller.getAllEvents(req, res);

    expect(serviceMock.getAllEvents).toHaveBeenCalledWith({
      category: "music",
      search: "fest",
      startDate: "2026-01-01",
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("getAllEvents handles thrown error", async () => {
    const req: Req = { query: {} };
    const res = makeRes();
    serviceMock.getAllEvents.mockRejectedValue({ statusCode: 500, message: "boom" });

    await controller.getAllEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("getUserEvents uses req.userId", async () => {
    const req: Req = { userId: "u1" };
    const res = makeRes();
    serviceMock.getUserEvents.mockResolvedValue([{ _id: "e1" }]);

    await controller.getUserEvents(req, res);

    expect(serviceMock.getUserEvents).toHaveBeenCalledWith("u1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("updateEvent returns 200 on success", async () => {
    const req: Req = { params: { eventId: "e1" }, body: { title: "New" }, userId: "u1" };
    const res = makeRes();
    serviceMock.updateEvent.mockResolvedValue({ _id: "e1", title: "New" });

    await controller.updateEvent(req, res);

    expect(serviceMock.updateEvent).toHaveBeenCalledWith("e1", { title: "New" }, "u1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deleteEvent returns 200 on success", async () => {
    const req: Req = { params: { eventId: "e1" }, userId: "u1" };
    const res = makeRes();
    serviceMock.deleteEvent.mockResolvedValue(undefined);

    await controller.deleteEvent(req, res);

    expect(serviceMock.deleteEvent).toHaveBeenCalledWith("e1", "u1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("joinEvent returns 200 and payload", async () => {
    const req: Req = { params: { eventId: "e1" }, userId: "u2" };
    const res = makeRes();
    serviceMock.joinEvent.mockResolvedValue({ _id: "e1" });

    await controller.joinEvent(req, res);

    expect(serviceMock.joinEvent).toHaveBeenCalledWith("e1", "u2");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("leaveEvent returns 200 and payload", async () => {
    const req: Req = { params: { eventId: "e1" }, userId: "u2" };
    const res = makeRes();
    serviceMock.leaveEvent.mockResolvedValue({ _id: "e1" });

    await controller.leaveEvent(req, res);

    expect(serviceMock.leaveEvent).toHaveBeenCalledWith("e1", "u2");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("respondToBudgetProposal returns accepted message", async () => {
    const req: Req = {
      params: { eventId: "e1" },
      userId: "u2",
      body: { accepted: true, message: "ok" },
    };
    const res = makeRes();
    serviceMock.respondToBudgetProposal.mockResolvedValue({ _id: "e1", budgetStatus: "accepted" });

    await controller.respondToBudgetProposal(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Budget accepted successfully" }));
  });

  it("respondToBudgetProposal returns response sent message", async () => {
    const req: Req = {
      params: { eventId: "e1" },
      userId: "u2",
      body: { accepted: false, counterProposal: 200 },
    };
    const res = makeRes();
    serviceMock.respondToBudgetProposal.mockResolvedValue({ _id: "e1", budgetStatus: "negotiating" });

    await controller.respondToBudgetProposal(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Budget response sent successfully" }));
  });

  it("getBudgetNegotiationHistory returns 200 with history", async () => {
    const req: Req = { params: { eventId: "e1" } };
    const res = makeRes();
    serviceMock.getBudgetNegotiationHistory.mockResolvedValue([{ proposer: "admin" }]);

    await controller.getBudgetNegotiationHistory(req, res);

    expect(serviceMock.getBudgetNegotiationHistory).toHaveBeenCalledWith("e1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("getBudgetNegotiationHistory handles service error", async () => {
    const req: Req = { params: { eventId: "e1" } };
    const res = makeRes();
    serviceMock.getBudgetNegotiationHistory.mockRejectedValue({ statusCode: 400, message: "bad history" });

    await controller.getBudgetNegotiationHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it("deleteEvent handles service error", async () => {
    const req: Req = { params: { eventId: "e1" }, userId: "u1" };
    const res = makeRes();
    serviceMock.deleteEvent.mockRejectedValue({ statusCode: 403, message: "Forbidden" });

    await controller.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("joinEvent handles service error", async () => {
    const req: Req = { params: { eventId: "e1" }, userId: "u2" };
    const res = makeRes();
    serviceMock.joinEvent.mockRejectedValue({ statusCode: 400, message: "full" });

    await controller.joinEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("leaveEvent handles service error", async () => {
    const req: Req = { params: { eventId: "e1" }, userId: "u2" };
    const res = makeRes();
    serviceMock.leaveEvent.mockRejectedValue({ statusCode: 404, message: "not found" });

    await controller.leaveEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updateEvent handles service error", async () => {
    const req: Req = { params: { eventId: "e1" }, body: {}, userId: "u1" };
    const res = makeRes();
    serviceMock.updateEvent.mockRejectedValue({ statusCode: 400, message: "bad update" });

    await controller.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
