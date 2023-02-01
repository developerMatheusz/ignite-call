import { Calendar } from "@/components";
import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";
import { Container, TimePicker, TimePickerHeader, TimePickerItem, TimePickerList } from "./styles";

interface Availability {
    possibleTimes: number[], 
    availableTimes: number[]
}

interface CalendarStepProps {
    onSelectedDateTime: (date: Date) => void;
}

export function CalendarStep({ onSelectedDateTime }: CalendarStepProps) {

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const router = useRouter();
    const username = String(router.query.username);

    const isDateSelected = !!selectedDate;

    const weekDay = selectedDate ? dayjs(selectedDate).format("dddd") : null;

    const describedDate = selectedDate ? dayjs(selectedDate).format("DD[ de ]MMMM") : null;

    const selectedDateWithoutTime = selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : null;

    //Hook useQuery só é executado caso selectedDate for modificado !!selectedDate.
    const { data: availability } = useQuery<Availability>(["availability", selectedDateWithoutTime], async () => {

        const response = await api.get(`/users/${username}/availability`, {
            params: {
                date: selectedDateWithoutTime
            }
        });

        console.log(response.data)

        return response.data;

    }, {
        enabled: !!selectedDate
    });

    function handleSelectTime(hour: number) {

        const dateWithTime = dayjs(selectedDate)
            .set("hour", hour)
            .startOf("hour")
            .toDate();

        onSelectedDateTime(dateWithTime);

    }

    return(

        <Container isTimePickerOpen={isDateSelected}>
            <Calendar 
                selectedDate={selectedDate} 
                onDateSelected={setSelectedDate}
            />
                {
                    isDateSelected && (
                        <TimePicker>
                            <TimePickerHeader>
                                {weekDay} <span>{describedDate}</span>
                            </TimePickerHeader>
                            <TimePickerList>
                                {
                                    availability?.possibleTimes.map(hour => {
                                        return(

                                            <TimePickerItem 
                                                key={hour} 
                                                disabled={!availability.availableTimes.includes(hour)} 
                                                onClick={() => handleSelectTime(hour)}
                                            >
                                                {String(hour).padStart(2, "0")}:00h
                                            </TimePickerItem>

                                        )
                                    })
                                }
                            </TimePickerList>
                        </TimePicker>
                    )
                }
        </Container>

    );

}
