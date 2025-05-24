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

    it("deve lançar erro ao tentar converter BookingEntity sem ID", () => {
        expect(() => BookingMapper.toDomain({} as BookingEntity)).toThrow();
    });

    it("deve lançar erro ao tentar converter Booking sem propriedade", () => {
        const booking = new Booking("1", null as any, null as any, new DateRange(new Date(), new Date()), 1);
        expect(() => BookingMapper.toPersistence(booking)).toThrow();
    });

});