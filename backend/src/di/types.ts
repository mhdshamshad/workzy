const TYPES = {
  // Auth
  AuthController: Symbol.for("AuthController"),
  AuthService: Symbol.for("AuthService"),

  // User
  UserRepository: Symbol.for("UserRepository"),
  UserService: Symbol.for("UserService"),
  UserController: Symbol.for("UserController"),

  // worker
  WorkerRepository: Symbol.for("WorkerRepository"),
  WorkerService: Symbol.for("WorkerService"),
  WorkerController: Symbol.for("WorkerController"),

  AdminController: Symbol.for("AdminController"),
  AdminWorkerController: Symbol.for("AdminWorkerController"),
  AdminUserController: Symbol.for("AdminUserController"),
  AdminBookingController: Symbol.for("AdminBookingController"),
  AdminBookingService: Symbol.for("AdminBookingService"),
  AdminService: Symbol.for("AdminService"),

  //category
  CategoryController: Symbol.for("CategoryController"),
  CategoryService: Symbol.for("CategoryService"),
  CategoryRepository: Symbol.for("CategoryRepository"),

  // admin
  AdminCategoryController: Symbol.for("AdminCategoryController"),
  CategoryManagementService: Symbol.for("CategoryManagementService"),

  // Miscellaneous / Utilities
  OTPService: Symbol.for("IOTPService"),
  EmailService: Symbol.for("IEmailService"),
  TokenService: Symbol.for("ITokenService"),

  // Upload
  UploadController: Symbol.for("UploadController"),
  S3Service: Symbol.for("S3Service"),
  RedisService: Symbol.for("RedisService"),

  // services
  ServiceController: Symbol.for("ServiceController"),
  ServiceManagement: Symbol.for("ServiceManagement"),
  ServiceRepository: Symbol.for("ServiceRepository"),

  NotificationRepository: Symbol.for("NotificationRepository"),
  NotificationService: Symbol.for("NotificationService"),
  NotificationController: Symbol.for("NotificationController"),

  SocketController: Symbol.for("SocketController"),
  PresenceService: Symbol.for("PresenceService"),
  ChatSocketController: Symbol.for("ChatSocketController"),

  // home
  HomeController: Symbol.for("HomeController"),
  HomeService: Symbol.for("HomeService"),
  HomeLayoutService: Symbol.for("HomeLayoutService"),
  HomeSectionService: Symbol.for("HomeSectionService"),
  HomeSectionRepository: Symbol.for("HomeSectionRepository"),
  HomeLayoutRepository: Symbol.for("HomeLayoutRepository"),

  PaymentController: Symbol.for("PaymentController"),
  PaymentRepository: Symbol.for("PaymentRepository"),
  PaymentService: Symbol.for("PaymentService"),

  SlotController: Symbol.for("SlotController"),
  SlotRepository: Symbol.for("SlotRepository"),
  SlotService: Symbol.for("SlotService"),

  QuoteController: Symbol.for("QuoteController"),
  QuoteRepository: Symbol.for("QuoteRepository"),
  QuoteService: Symbol.for("QuoteService"),

  LeaveController: Symbol.for("LeaveController"),
  LeaveRepository: Symbol.for("LeaveRepository"),
  LeaveService: Symbol.for("LeaveService"),

  BookingController: Symbol.for("BookingController"),
  BookingService: Symbol.for("BookingService"),
  BookingPricingService: Symbol.for("BookingPricingService"),
  BookingRescheduleService: Symbol.for("BookingRescheduleService"),
  BookingExtraChargeService: Symbol.for("BookingExtraChargeService"),
  BookingLifecycleService: Symbol.for("BookingLifecycleService"),
  BookingRepository: Symbol.for("BookingRepository"),
  BookingPaymentHandler: Symbol.for("BookingPaymentHandler"),
  BookingDayController: Symbol.for("BookingDayController"),
  BookingDayService: Symbol.for("BookingDayService"),

  ReviewController: Symbol.for("ReviewController"),
  ReviewService: Symbol.for("ReviewService"),
  ReviewRepository: Symbol.for("ReviewRepository"),

  DisputeController: Symbol.for("DisputeController"),
  DisputeService: Symbol.for("DisputeService"),
  DisputeRepository: Symbol.for("DisputeRepository"),

  MessageController: Symbol.for("MessageController"),
  MessageService: Symbol.for("MessageService"),
  MessageRepository: Symbol.for("MessageRepository"),

  ChatController: Symbol.for("ChatController"),
  ChatService: Symbol.for("ChatService"),
  ChatRepository: Symbol.for("ChatRepository"),

  UnitOfWork: Symbol.for("UnitOfWork"),
};

export { TYPES };
