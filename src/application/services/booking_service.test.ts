import { Booking } from "../../domain/entities/booking";
import { BookingService } from "../../application/services/booking_service";
import { PropertyService } from "../../application/services/property_service";
import { UserService } from "../../application/services/user_service";
import { CreateBookingDTO } from "../../application/dtos/create_booking_dto";
import { FakeBookingRepository } from "../../infrastructure/repositories/fake_booking_repository";

jest.mock("./property_service");
jest.mock("./user_service");

describe("BookingService", () => {
  let bookingService: BookingService;
  let fakeBookingRepository: FakeBookingRepository;
  let mockPropertyService: jest.Mocked<PropertyService>;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    const mockPropertyRepositoy = {} as any;
    const mockUserRepositoy = {} as any;

    mockPropertyService = new PropertyService(
      mockPropertyRepositoy
    ) as jest.Mocked<PropertyService>;

    mockUserService = new UserService(
      mockUserRepositoy
    ) as jest.Mocked<UserService>;

    fakeBookingRepository = new FakeBookingRepository();

    bookingService = new BookingService(
      fakeBookingRepository,
      mockPropertyService,
      mockUserService
    );
  });

  it("deve criar uma reserva com sucesso usando respositorio fake", async () => {
    const mockProperty = {
      getId: jest.fn().mockReturnValue("1"),
      isAvailable: jest.fn().mockReturnValue(true),
      validateGuestCount: jest.fn(),
      calculateTotalPrice: jest.fn().mockReturnValue(500),
      addBooking: jest.fn(),
    } as any;

    const mockUser = {
      getId: jest.fn().mockReturnValue("1"),
    } as any;

    mockPropertyService.findPropertyById.mockResolvedValue(mockProperty);
    mockUserService.findUserById.mockResolvedValue(mockUser);

    const bookingDTO: CreateBookingDTO = {
      propertyId: "1",
      guestId: "1",
      startDate: new Date("2024-12-20"),
      endDate: new Date("2024-12-25"),
      guestCount: 2,
    };

    const result = await bookingService.createBooking(bookingDTO);

    expect(result).toBeInstanceOf(Booking);
    expect(result.getStatus()).toBe("CONFIRMED");
    expect(result.getTotalPrice()).toBe(500);

    const savedBooking = await fakeBookingRepository.findById(result.getId());
    expect(savedBooking).not.toBeNull();
    expect(savedBooking?.getId()).toBe(result.getId());
  });

  it("deve lançar um erro quando a propriedade não for encontrada", async () => {
    mockPropertyService.findPropertyById.mockResolvedValue(null);

    const bookingDTO: CreateBookingDTO = {
      propertyId: "1",
      guestId: "1",
      startDate: new Date("2024-12-20"),
      endDate: new Date("2024-12-25"),
      guestCount: 2,
    };

    await expect(bookingService.createBooking(bookingDTO)).rejects.toThrow(
      "Propriedade não encontrada."
    );
  });

  it("deve lançar um erro quando o usuário não for encontrado", async () => {
    const mockProperty = {
      getId: jest.fn().mockReturnValue("1"),
    } as any;

    mockPropertyService.findPropertyById.mockResolvedValue(mockProperty);
    mockUserService.findUserById.mockResolvedValue(null);

    const bookingDTO: CreateBookingDTO = {
      propertyId: "1",
      guestId: "1",
      startDate: new Date("2024-12-20"),
      endDate: new Date("2024-12-25"),
      guestCount: 2,
    };

    await expect(bookingService.createBooking(bookingDTO)).rejects.toThrow(
      "Usuário não encontrado."
    );
  });

  it("deve lançar um erro ao tentar criar reserva para um período já reservado", async () => {
    const mockProperty = {
      getId: jest.fn().mockReturnValue("1"),
      isAvailable: jest.fn().mockReturnValue(true),
      validateGuestCount: jest.fn(),
      calculateTotalPrice: jest.fn().mockReturnValue(500),
      addBooking: jest.fn(),
    } as any;

    const mockUser = {
      getId: jest.fn().mockReturnValue("1"),
    } as any;

    mockPropertyService.findPropertyById.mockResolvedValue(mockProperty);
    mockUserService.findUserById.mockResolvedValue(mockUser);

    const bookingDTO: CreateBookingDTO = {
      propertyId: "1",
      guestId: "1",
      startDate: new Date("2024-12-20"),
      endDate: new Date("2024-12-25"),
      guestCount: 2,
    };

    const result = await bookingService.createBooking(bookingDTO);

    mockProperty.isAvailable.mockReturnValue(false);
    mockProperty.addBooking.mockImplementationOnce(() => {
      throw new Error(
        "A propriedade não está disponível para o período selecionado."
      );
    });

    await expect(bookingService.createBooking(bookingDTO)).rejects.toThrow(
      "A propriedade não está disponível para o período selecionado."
    );
  });

  it("deve cancelar uma reserva existente usando o repositório fake", async () => {
    const mockProperty = {
      getId: jest.fn().mockReturnValue("1"),
      isAvailable: jest.fn().mockReturnValue(true),
      validateGuestCount: jest.fn(),
      calculateTotalPrice: jest.fn().mockReturnValue(500),
      addBooking: jest.fn(),
    } as any;

    const mockUser = {
      getId: jest.fn().mockReturnValue("1"),
    } as any;

    mockPropertyService.findPropertyById.mockResolvedValue(mockProperty);
    mockUserService.findUserById.mockResolvedValue(mockUser);

    const bookingDTO: CreateBookingDTO = {
      propertyId: "1",
      guestId: "1",
      startDate: new Date("2024-12-20"),
      endDate: new Date("2024-12-25"),
      guestCount: 2,
    };

    const booking = await bookingService.createBooking(bookingDTO);

    const spyFindById = jest.spyOn(fakeBookingRepository, "findById");

    await bookingService.cancelBooking(booking.getId());

    const canceledBooking = await fakeBookingRepository.findById(
      booking.getId()
    );

    expect(canceledBooking?.getStatus()).toBe("CANCELLED");
    expect(spyFindById).toHaveBeenCalledWith(booking.getId());
    expect(spyFindById).toHaveBeenCalledTimes(2);
    spyFindById.mockRestore();
  });

  it("deve lançar um erro ao tentar cancelar uma reserva inexistente", async () => {
    const bookingId = "invalid-id";

    await expect(bookingService.cancelBooking(bookingId)).rejects.toThrow(
      "Reserva não encontrada."
    );
  });

  it("deve retornar erro ao tentar cancelar uma reserva que não existe", async () => {
    const bookingId = "invalid-id";
    const spyFindById = jest.spyOn(fakeBookingRepository, "findById");

    await expect(bookingService.cancelBooking(bookingId)).rejects.toThrow(
      "Reserva não encontrada."
    );

    expect(spyFindById).toHaveBeenCalledWith(bookingId);
    expect(spyFindById).toHaveBeenCalledTimes(1);
  });

  it("deve lançar um erro ao tentar criar uma reserva com número de hóspedes inválido", async () => {
    const mockProperty = {
      getId: jest.fn().mockReturnValue("1"),
      isAvailable: jest.fn().mockReturnValue(true),
      validateGuestCount: jest.fn().mockImplementation(() => {
        throw new Error("Número de hóspedes inválido.");
      }),
    } as any;

    const mockUser = { getId: jest.fn().mockReturnValue("1") } as any;

    mockPropertyService.findPropertyById.mockResolvedValue(mockProperty);
    mockUserService.findUserById.mockResolvedValue(mockUser);

    const bookingDTO: CreateBookingDTO = {
      propertyId: "1",
      guestId: "1",
      startDate: new Date("2024-12-20"),
      endDate: new Date("2024-12-25"),
      guestCount: 0, 
    };

    await expect(bookingService.createBooking(bookingDTO)).rejects.toThrow(
      "O número de hóspedes deve ser maior que zero."
    );
  });

  it("deve lançar um erro ao tentar cancelar uma reserva já cancelada", async () => {
    const mockBooking = {
      getId: jest.fn().mockReturnValue("1"),
      getStatus: jest.fn().mockReturnValue("CANCELLED"),
      cancel: jest.fn().mockImplementation(() => {
        throw new Error("A reserva já está cancelada.");
      }),
    } as any;

    jest.spyOn(fakeBookingRepository, "findById").mockResolvedValue(mockBooking);

    await expect(bookingService.cancelBooking(mockBooking.getId())).rejects.toThrow(
      "A reserva já está cancelada."
    );
  });

  it("deve lançar um erro ao tentar criar uma reserva com datas inválidas", async () => {
    const bookingDTO: CreateBookingDTO = {
      propertyId: "1",
      guestId: "1",
      startDate: new Date("2024-12-25"),
      endDate: new Date("2024-12-20"), 
      guestCount: 2,
    };

    await expect(bookingService.createBooking(bookingDTO)).rejects.toThrow(
      "Data de início não pode ser posterior à data de término."
    );
  });

  it("deve garantir que o método cancel seja chamado apenas uma vez", async () => {
    const mockBooking = {
      getId: jest.fn().mockReturnValue("1"),
      getStatus: jest.fn().mockReturnValue("CONFIRMED"),
      cancel: jest.fn(),
    } as any;

    jest.spyOn(fakeBookingRepository, "findById").mockResolvedValue(mockBooking);

    await bookingService.cancelBooking(mockBooking.getId());

    expect(mockBooking.cancel).toHaveBeenCalledTimes(1);
  });

  it("deve lançar um erro ao tentar criar uma reserva para uma data passada", async () => {
    const bookingDTO: CreateBookingDTO = {
      propertyId: "1",
      guestId: "1",
      startDate: new Date("2021-01-01"), 
      endDate: new Date("2021-01-05"),
      guestCount: 2,
    };

    await expect(bookingService.createBooking(bookingDTO)).rejects.toThrow(
      "A data de início não pode estar no passado."
    );
  }); 

  it("deve garantir que a reserva cancelada seja salva no repositório", async () => {
    const mockBooking = {
      getId: jest.fn().mockReturnValue("1"),
      cancel: jest.fn(),
    } as any;

    jest.spyOn(fakeBookingRepository, "findById").mockResolvedValue(mockBooking);
    jest.spyOn(fakeBookingRepository, "save");

    await bookingService.cancelBooking(mockBooking.getId());

    expect(mockBooking.cancel).toHaveBeenCalled();
    expect(fakeBookingRepository.save).toHaveBeenCalledWith(mockBooking);
  });


});
