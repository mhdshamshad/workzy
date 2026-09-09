import { Container } from "inversify";

import { AdminBookingController } from "@/controllers/admin/admin-booking.controller";
import { AdminCategoryController } from "@/controllers/admin/admin-category.controller";
import { AdminUserController } from "@/controllers/admin/admin-user.controller";
import { AdminWorkerController } from "@/controllers/admin/admin-worker.controller";
import { AdminController } from "@/controllers/admin/admin.controller";
import { AuthController } from "@/controllers/auth.controller";
import { BookingDayController } from "@/controllers/booking-day.controller";
import { BookingController } from "@/controllers/booking.controller";
import { CategoryController } from "@/controllers/category.controller";
import { ChatSocketController } from "@/controllers/chat-socket.controller";
import { ChatController } from "@/controllers/chat.controller";
import { DisputeController } from "@/controllers/dispute.controller";
import { HomeController } from "@/controllers/home.controller";
import { LeaveController } from "@/controllers/leave.controller";
import { MessageController } from "@/controllers/message.controller";
import { NotificationController } from "@/controllers/notification.controller";
import { PaymentController } from "@/controllers/payment.controller";
import { QuoteController } from "@/controllers/quote.controller";
import { ReviewController } from "@/controllers/review.controller";
import { ServiceController } from "@/controllers/service.controller";
import { SlotController } from "@/controllers/slot.controller";
import { SocketController } from "@/controllers/socket.controller";
import { UploadController } from "@/controllers/upload.controller";
import { UserController } from "@/controllers/user.controller";
import { WorkerController } from "@/controllers/worker.controller";
import { IAdminBookingController } from "@/core/interfaces/controllers/admin/IAdminBookingController";
import { IAdminCategoryController } from "@/core/interfaces/controllers/admin/IAdminCategoryController";
import { IAdminController } from "@/core/interfaces/controllers/admin/IAdminController";
import { IAdminUserController } from "@/core/interfaces/controllers/admin/IAdminUserController";
import { IAdminWorkerController } from "@/core/interfaces/controllers/admin/IAdminWorkerController";
import { IAuthController } from "@/core/interfaces/controllers/IAuthController";
import { IBookingController } from "@/core/interfaces/controllers/IBookingController";
import { IBookingDayController } from "@/core/interfaces/controllers/IBookingDayController";
import { ICategoryController } from "@/core/interfaces/controllers/ICategoryController";
import { IChatController } from "@/core/interfaces/controllers/IChatController";
import { IChatSocketController } from "@/core/interfaces/controllers/IChatSocketController";
import { IDisputeController } from "@/core/interfaces/controllers/IDisputeController";
import { IHomeController } from "@/core/interfaces/controllers/IHomeController";
import { ILeaveController } from "@/core/interfaces/controllers/ILeaveController";
import { IMessageController } from "@/core/interfaces/controllers/IMessageController";
import { INotificationController } from "@/core/interfaces/controllers/INotificationController";
import { IPaymentController } from "@/core/interfaces/controllers/IPaymentController";
import { IQuoteController } from "@/core/interfaces/controllers/IQuoteController";
import { IReviewController } from "@/core/interfaces/controllers/IReviewController";
import { IServiceController } from "@/core/interfaces/controllers/IServiceController";
import { ISlotController } from "@/core/interfaces/controllers/ISlotController";
import { IUploadController } from "@/core/interfaces/controllers/IUploadController";
import { IUserController } from "@/core/interfaces/controllers/IUserController";
import { IWorkerController } from "@/core/interfaces/controllers/IWorkerController";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { ICategoryRepository } from "@/core/interfaces/repositories/ICategoryRepository";
import { IChatRepository } from "@/core/interfaces/repositories/IChatRepository";
import { IDisputeRepository } from "@/core/interfaces/repositories/IDisputeRepository";
import { IHomeLayoutRepository } from "@/core/interfaces/repositories/IHomeLayoutRepository";
import { IHomeSectionRepository } from "@/core/interfaces/repositories/IHomeSectionRepository";
import { ILeaveRepository } from "@/core/interfaces/repositories/ILeaveRepository";
import { IMessageRepository } from "@/core/interfaces/repositories/IMessageRepository";
import { INotificationRepository } from "@/core/interfaces/repositories/INotificationRepository";
import { IPaymentRepository } from "@/core/interfaces/repositories/IPaymentRepository";
import { IQuoteRepository } from "@/core/interfaces/repositories/IQuoteRepository";
import { IReviewRepository } from "@/core/interfaces/repositories/IReviewRepository";
import { IServiceRepository } from "@/core/interfaces/repositories/IServiceRepository";
import { ISlotRepository } from "@/core/interfaces/repositories/ISlotRepository";
import { IUserRepository } from "@/core/interfaces/repositories/IUserRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IAdminBookingService } from "@/core/interfaces/services/admin/IAdminBookingService";
import { ICategoryManagementService } from "@/core/interfaces/services/admin/ICategoryManagementService";
import { IAdminService } from "@/core/interfaces/services/IAdminService";
import { IAuthService } from "@/core/interfaces/services/IAuthService";
import { IBookingDayService } from "@/core/interfaces/services/IBookingDayService";
import { IBookingPaymentHandler } from "@/core/interfaces/services/IBookingPaymentHandler";
import { IBookingService } from "@/core/interfaces/services/IBookingService";
import { ICategoryService } from "@/core/interfaces/services/ICategoryService";
import { IChatService } from "@/core/interfaces/services/IChatService";
import { IDisputeService } from "@/core/interfaces/services/IDisputeService";
import { IEmailService } from "@/core/interfaces/services/IEmailService";
import { IHomeLayoutService } from "@/core/interfaces/services/IHomeLayoutService";
import { IHomeSectionService } from "@/core/interfaces/services/IHomeSectionService";
import { IHomeService } from "@/core/interfaces/services/IHomeService";
import { ILeaveService } from "@/core/interfaces/services/ILeaveService";
import { IMessageService } from "@/core/interfaces/services/IMessageService";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IOTPService } from "@/core/interfaces/services/IOTPService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IPresenceService } from "@/core/interfaces/services/IPresenceService";
import { IQuoteService } from "@/core/interfaces/services/IQuoteService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IReviewService } from "@/core/interfaces/services/IReviewService";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import { IServiceManagement } from "@/core/interfaces/services/IServiceManagement";
import { ISlotService } from "@/core/interfaces/services/ISlotService";
import { ITokenService } from "@/core/interfaces/services/ITokenService";
import { IUnitOfWork } from "@/core/interfaces/services/IUnitOfWork";
import { IUserService } from "@/core/interfaces/services/IUserService";
import { IWorkerService } from "@/core/interfaces/services/IWorkerService";
import { BookingRepository } from "@/repositories/booking.repository";
import { CategoryRepository } from "@/repositories/category.repository";
import { ChatRepository } from "@/repositories/chat.repository";
import { DisputeRepository } from "@/repositories/dispute.repository";
import { HomeLayoutRepository } from "@/repositories/homeLayout..repository";
import { HomeSectionRepository } from "@/repositories/homeSection.repository";
import { LeaveRepository } from "@/repositories/leave.repository";
import { MessageRepository } from "@/repositories/message.repository";
import { NotificationRepository } from "@/repositories/notification.repository";
import { PaymentRepository } from "@/repositories/payment.repository";
import { QuoteRepository } from "@/repositories/quote.repository";
import { ReviewRepository } from "@/repositories/review.repository";
import { ServiceRepository } from "@/repositories/service.repository";
import { SlotRepository } from "@/repositories/slot.repository";
import { UserRepository } from "@/repositories/user.repository";
import { WorkerRepository } from "@/repositories/worker.repository";
import { AdminService } from "@/services/admin/admin.service";
import { AdminBookingService } from "@/services/admin/booking.service";
import { CategoryManagementService } from "@/services/admin/category-management.service";
import { HomeLayoutService } from "@/services/admin/home-layout.service";
import { HomeSectionService } from "@/services/admin/home-section.service";
import { AuthService } from "@/services/auth/auth.service";
import { EmailService } from "@/services/auth/email.service";
import { OTPService } from "@/services/auth/otp.service";
import { TokenService } from "@/services/auth/token.service";
import { BookingDayService } from "@/services/booking-day.service";
import { BookingPaymentHandlerService } from "@/services/booking-payment-handler.service";
import { BookingService } from "@/services/booking.service";
import { CategoryService } from "@/services/category.service";
import { ChatService } from "@/services/chat.service";
import { DisputeService } from "@/services/dispute.service";
import { HomeService } from "@/services/home.service";
import { LeaveService } from "@/services/leave.service";
import { MessageService } from "@/services/message.service";
import { NotificationService } from "@/services/notification.service";
import { PaymentService } from "@/services/payment.service";
import { PresenceService } from "@/services/presence.service";
import { QuoteService } from "@/services/quote.service";
import { RedisService } from "@/services/redis.service";
import { ReviewService } from "@/services/review.service";
import { S3Service } from "@/services/s3.service";
import { ServiceManagement } from "@/services/service-management.service";
import { SlotService } from "@/services/slot.service";
import { UnitOfWork } from "@/services/unit-of-work.service";
import { UserService } from "@/services/user.service";
import { WorkerService } from "@/services/worker.service";

import { TYPES } from "./types";

const container = new Container();

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IAuthController>(TYPES.AuthController).to(AuthController);

container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IUserController>(TYPES.UserController).to(UserController);

container.bind<IOTPService>(TYPES.OTPService).to(OTPService);
container.bind<IEmailService>(TYPES.EmailService).to(EmailService);
container.bind<ITokenService>(TYPES.TokenService).to(TokenService);

container.bind<IWorkerRepository>(TYPES.WorkerRepository).to(WorkerRepository);
container.bind<IWorkerService>(TYPES.WorkerService).to(WorkerService);
container.bind<IWorkerController>(TYPES.WorkerController).to(WorkerController);

container.bind<IAdminController>(TYPES.AdminController).to(AdminController);
container.bind<IAdminService>(TYPES.AdminService).to(AdminService);

container.bind<IAdminUserController>(TYPES.AdminUserController).to(AdminUserController);
container.bind<IAdminWorkerController>(TYPES.AdminWorkerController).to(AdminWorkerController);
container.bind<IAdminCategoryController>(TYPES.AdminCategoryController).to(AdminCategoryController);
container.bind<IAdminBookingController>(TYPES.AdminBookingController).to(AdminBookingController);
container.bind<IAdminBookingService>(TYPES.AdminBookingService).to(AdminBookingService);

// categories
container.bind<ICategoryRepository>(TYPES.CategoryRepository).to(CategoryRepository);
container.bind<ICategoryController>(TYPES.CategoryController).to(CategoryController);
container.bind<ICategoryService>(TYPES.CategoryService).to(CategoryService);
container
  .bind<ICategoryManagementService>(TYPES.CategoryManagementService)
  .to(CategoryManagementService);

container.bind<IS3Service>(TYPES.S3Service).to(S3Service);
container.bind<IUploadController>(TYPES.UploadController).to(UploadController);

container.bind<IRedisService>(TYPES.RedisService).to(RedisService);

container.bind<IServiceController>(TYPES.ServiceController).to(ServiceController);
container.bind<IServiceManagement>(TYPES.ServiceManagement).to(ServiceManagement);
container.bind<IServiceRepository>(TYPES.ServiceRepository).to(ServiceRepository);

container.bind<IHomeController>(TYPES.HomeController).to(HomeController);
container.bind<IHomeService>(TYPES.HomeService).to(HomeService);
container.bind<IHomeSectionService>(TYPES.HomeSectionService).to(HomeSectionService);
container.bind<IHomeLayoutService>(TYPES.HomeLayoutService).to(HomeLayoutService);
container.bind<IHomeLayoutRepository>(TYPES.HomeLayoutRepository).to(HomeLayoutRepository);
container.bind<IHomeSectionRepository>(TYPES.HomeSectionRepository).to(HomeSectionRepository);

container.bind<IPaymentController>(TYPES.PaymentController).to(PaymentController);
container.bind<IPaymentRepository>(TYPES.PaymentRepository).to(PaymentRepository);
container.bind<IPaymentService>(TYPES.PaymentService).to(PaymentService);

container.bind<ISlotController>(TYPES.SlotController).to(SlotController);
container.bind<ISlotService>(TYPES.SlotService).to(SlotService);
container.bind<ISlotRepository>(TYPES.SlotRepository).to(SlotRepository);

container.bind<IQuoteController>(TYPES.QuoteController).to(QuoteController);
container.bind<IQuoteService>(TYPES.QuoteService).to(QuoteService);
container.bind<IQuoteRepository>(TYPES.QuoteRepository).to(QuoteRepository);

container.bind<ILeaveController>(TYPES.LeaveController).to(LeaveController);
container.bind<ILeaveService>(TYPES.LeaveService).to(LeaveService);
container.bind<ILeaveRepository>(TYPES.LeaveRepository).to(LeaveRepository);

container.bind<IBookingController>(TYPES.BookingController).to(BookingController);
container.bind<IBookingRepository>(TYPES.BookingRepository).to(BookingRepository);
container.bind<IBookingService>(TYPES.BookingService).to(BookingService);
container
  .bind<IBookingPaymentHandler>(TYPES.BookingPaymentHandler)
  .to(BookingPaymentHandlerService);

container.bind<IBookingDayService>(TYPES.BookingDayService).to(BookingDayService);
container.bind<IBookingDayController>(TYPES.BookingDayController).to(BookingDayController);

container.bind<IReviewController>(TYPES.ReviewController).to(ReviewController);
container.bind<IReviewService>(TYPES.ReviewService).to(ReviewService);
container.bind<IReviewRepository>(TYPES.ReviewRepository).to(ReviewRepository);

container.bind<INotificationRepository>(TYPES.NotificationRepository).to(NotificationRepository);
container.bind<INotificationService>(TYPES.NotificationService).to(NotificationService);
container.bind<INotificationController>(TYPES.NotificationController).to(NotificationController);

container.bind<SocketController>(TYPES.SocketController).to(SocketController);
container.bind<IChatSocketController>(TYPES.ChatSocketController).to(ChatSocketController);

container.bind<IPresenceService>(TYPES.PresenceService).to(PresenceService);

container.bind<IDisputeRepository>(TYPES.DisputeRepository).to(DisputeRepository);
container.bind<IDisputeService>(TYPES.DisputeService).to(DisputeService);
container.bind<IDisputeController>(TYPES.DisputeController).to(DisputeController);

container.bind<IMessageRepository>(TYPES.MessageRepository).to(MessageRepository);
container.bind<IMessageService>(TYPES.MessageService).to(MessageService);
container.bind<IMessageController>(TYPES.MessageController).to(MessageController);

container.bind<IChatRepository>(TYPES.ChatRepository).to(ChatRepository);
container.bind<IChatService>(TYPES.ChatService).to(ChatService);
container.bind<IChatController>(TYPES.ChatController).to(ChatController);

container.bind<IUnitOfWork>(TYPES.UnitOfWork).to(UnitOfWork).inSingletonScope();

export { container };
