import { BookingEntity } from "../entities/booking_entity";
import { BookingMapper } from "./booking_mapper";
import { Booking } from "../../../domain/entities/booking";
import { Property } from "../../../domain/entities/property";
import { User } from "../../../domain/entities/user";
import { UserMapper } from "./user_mapper";
import { DateRange } from "../../../domain/value_objects/date_range";


describe('BookingMapper', () => {
    it("deve converter BookingEntity para Booking corretamente", () => {
        const entity: BookingEntity = {
            id: "1",
            property: {
                id: "2",
                name: "Casa de Praia",
                description: "Uma casa de praia linda",
                maxGuests: 4,
                basePricePerNight: 100,
                bookings: []
            },
            guest: {
                id: "3",
                name: "João Manuel",
            },
            startDate: new Date("2025-06-01"),
            endDate: new Date("2025-06-10"),
            guestCount: 2,
            totalPrice: 900,
            status: "CONFIRMED",

        };

        const booking = BookingMapper.toDomain(entity);

        expect(booking.getId()).toBe("1");
        expect(booking.getProperty().getId()).toBe("2");
        expect(booking.getGuest().getId()).toBe("3");
        expect(booking.getDateRange().getStartDate()).toEqual(new Date("2025-06-01"));
        expect(booking.getDateRange().getEndDate()).toEqual(new Date("2025-06-10"));
        expect(booking.getGuestCount()).toBe(2);
        expect(booking.getTotalPrice()).toBe(900);
        expect(booking.getStatus()).toBe("CONFIRMED");
    });

    it("deve converter Booking para BookingEntity corretamente", () => {
        const property = new Property("2", "Casa de Praia", "Uma casa de praia linda", 4, 100);
        const guest = UserMapper.toDomain({id: "3", name: "João Manuel"});
        const dateRange = new DateRange(new Date("2025-06-01"), new Date("2025-06-10"));
        const booking = new Booking("1", property, guest, dateRange, 2);
        booking["totalPrice"] = 900;
        booking["status"] = "CONFIRMED";

        const entity = BookingMapper.toPersistence(booking);
        
        expect(entity.id).toBe("1");
        expect(entity.property.id).toBe("2");
        expect(entity.guest.id).toBe("3");
        expect(entity.startDate).toEqual(new Date("2025-06-01"));
        expect(entity.endDate).toEqual(new Date("2025-06-10"));
        expect(entity.guestCount).toBe(2);
        expect(entity.totalPrice).toBe(900);
        expect(entity.status).toBe("CONFIRMED");
        
    });

    it("deve lançar erro de validação ao faltar campos obrigatórios no BookingEntity", () => {
        const entitySemId: Partial<BookingEntity> = {
            property: {
                id: "2",
                name: "Casa de Praia",
                description: "Uma casa de praia linda",
                maxGuests: 4,
                basePricePerNight: 100,
                bookings: [],
            },
            guest: { id: "3", name: "João Manuel" },
            startDate: new Date("2025-06-01"),
            endDate: new Date("2025-06-10"),
            guestCount: 2,
            totalPrice: 900,
            status: "CONFIRMED",
        };
        
        const entitySemPropriedade = {
            id: "1",
            guest: { id: "3", name: "João Manuel" },
            startDate: new Date("2025-06-01"),
            endDate: new Date("2025-06-10"),
            guestCount: 2,
            totalPrice: 900,
            status: "CONFIRMED",
        } as BookingEntity;
        
        const entitySemGuest: BookingEntity = {
        id: "1",
            property: {
                id: "2",
                name: "Casa de Praia",
                description: "Uma casa de praia linda",
                maxGuests: 4,
                basePricePerNight: 100,
                bookings: [],
            },
            startDate: new Date("2025-06-01"),
            endDate: new Date("2025-06-10"),
            guestCount: 2,
            totalPrice: 900,
            status: "CONFIRMED",
        } as unknown as BookingEntity;

        const entitySemCountGuest: BookingEntity = {
        id: "1",
            property: {
                id: "2",
                name: "Casa de Praia",
                description: "Uma casa de praia linda",
                maxGuests: 4,
                basePricePerNight: 100,
                bookings: [],
            },
            guest: { id: "3", name: "João Manuel" },
            startDate: new Date("2025-06-01"),
            endDate: new Date("2025-06-10"),
            totalPrice: 900,
            status: "CONFIRMED",
        } as unknown as BookingEntity;

        expect(() => BookingMapper.toDomain(entitySemId as BookingEntity)).toThrowError("O ID da reserva é obrigatório.");
        expect(() => BookingMapper.toDomain(entitySemPropriedade)).toThrowError("A propriedade é obrigatória.");
        expect(() => BookingMapper.toDomain(entitySemGuest)).toThrowError("O guest é obrigatório.");
        expect(() => BookingMapper.toDomain(entitySemCountGuest)).toThrowError("O número de hóspedes é obrigatório.");
         
    });

    it("deve lançar erro ao tentar converter Booking sem propriedade", () => {
        const property = null as any;
        const guest = UserMapper.toDomain({ id: "2", name: "João Manuel" });
        const dateRange = new DateRange(new Date("2025-06-01"), new Date("2025-06-10"));

        expect(() => new Booking("1", property, guest, dateRange, 2)).toThrowError("Propriedade não pode ser nula.");
    });

    it("deve lançar erro ao criar Booking com número de hóspedes inválido", () => {
        const property = new Property("2", "Casa de Praia", "Uma casa de praia linda", 4, 100);
        const guest = UserMapper.toDomain({ id: "3", name: "João Manuel" });
        const dateRange = new DateRange(new Date("2025-06-01"), new Date("2025-06-10"));

        expect(() => new Booking("1", property, guest, dateRange, 0)).toThrowError("O número de hóspedes deve ser maior que zero.");
    });

    it("deve lançar erro ao tentar cancelar uma reserva já cancelada", () => {
        const property = new Property("2", "Casa de Praia", "Uma casa de praia linda", 4, 100);
        const guest = UserMapper.toDomain({ id: "3", name: "João Manuel" });
        const dateRange = new DateRange(new Date("2025-06-01"), new Date("2025-06-10"));
        const booking = new Booking("1", property, guest, dateRange, 2);
        
        booking.cancel(new Date("2025-05-25")); // Cancela a reserva

        expect(() => booking.cancel(new Date("2025-05-26"))).toThrowError("A reserva já está cancelada.");
    });

});