import { api } from "@/lib/axios";
import { getWeekDays } from "@/utils/get-week-days";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { CaretLeft, CaretRight } from "phosphor-react";
import { useMemo, useState } from "react";
import { CalendarActions, CalendarBody, CalendarContainer, CalendarDay, CalendarHeader, CalendarTitle } from "./styles";

interface CalendarWeek {
    week: number, 
    days: Array<{
        date: dayjs.Dayjs, 
        disabled: boolean
    }>;
}

type CalendarWeeks = CalendarWeek[];

interface BlockedDates {
    blockedWeekDay: number[]
}

interface CalendarProps {
    selectedDate?: Date | null, 
    onDateSelected: (date: Date) => void;
}

export function Calendar({ selectedDate, onDateSelected }: CalendarProps) {

    const [currentDate, setCurrentDate] = useState(() => {
        return dayjs().set("date", 1);
    });

    const currentMonth = currentDate.format("MMMM");
    const currentYear = currentDate.format("YYYY");

    const shortWeekDays = getWeekDays({ short: true });
    const router = useRouter();

    const username = String(router.query.username);
    
    const { data: blockedDates } = useQuery<BlockedDates>(
        [
            "blocked-dates", 
            currentDate.get("year"), 
            currentDate.get("month")
        ], 
        async () => {
            const response = await api.get(`/users/${username}/blocked-dates`, {
                params: {
                    year: currentDate.get("year"), 
                    month: currentDate.get("month")
                }
            });
            return response.data;
        }
    );

    //Array de dias da semana [ [1, 2, 3], [4, 5, 6], [7, 8, 9] ]

    //useMemo serve para memorizar funções e somente permitir que uma função seja executada quando realmente for necessária.

    //Serve para evitar que cada atualização boba que a página sofra, o método seja executado e desperdiçado tempo de execução.

    //date é dia do mês, day é dia da semana.
    const calendarWeeks = useMemo(() => {

        if (!blockedDates) {
            return [];
        }

        const daysInMonthArray = Array.from({
            length: currentDate.daysInMonth()
        }).map((_, i) => {
            return currentDate.set("date", i + 1);
        });

        const firstWeekDay = currentDate.get("day");

        const previousMonthFillArray = Array.from({
            length: firstWeekDay
        }).map((_, i) => {
            return currentDate.subtract(i + 1, "day");
        }).reverse();

        const lastDayInCurrentMonth = currentDate.set("date", currentDate.daysInMonth());
        const lastWeekDay = lastDayInCurrentMonth.get("day");

        const nextMonthFillArray = Array.from({
            length: 7 - (lastWeekDay + 1)
        }).map((_, i) => {
            return lastDayInCurrentMonth.add(i + 1, "day");
        });

        const calendarDays = [

            ...previousMonthFillArray.map((date) => {
                return { date, disabled: true }
            }), 

            ...daysInMonthArray.map((date) => {
                return { 
                    date, 
                    disabled: date
                        .endOf("day")
                        .isBefore(new Date()) || blockedDates.blockedWeekDay
                        .includes(
                            date.get("day")
                        )
                }
            }), 

            ...nextMonthFillArray.map((date) => {
                return { date, disabled: true }
            })

        ];

        const calendarWeeks = calendarDays.reduce<CalendarWeeks>((weeks, _, i, original) => {

            const isNewWeek = i % 7 === 0;

            if (isNewWeek) {
                weeks.push({
                    week: i / 7 + 1, 
                    days: original.slice(i, i + 7)
                });
            }

            return weeks;

        }, []);

        return calendarWeeks;

    }, [currentDate, blockedDates]);

    function handlePreviousMonth() {
        
        const previousMonthDate = currentDate.subtract(1, "month");
        setCurrentDate(previousMonthDate);

    }

    function handleNextMonth() {

        const nextMonthDate = currentDate.add(1, "month");
        setCurrentDate(nextMonthDate);

    }

    return(

        <CalendarContainer>
            <CalendarHeader>
                <CalendarTitle>
                    {currentMonth} <span>{currentYear}</span>
                </CalendarTitle>
                <CalendarActions>
                    <button 
                        onClick={handlePreviousMonth} 
                        title="Previous month"
                    >
                        <CaretLeft/>
                    </button>
                    <button 
                        onClick={handleNextMonth} 
                        title="Next month"
                    >
                        <CaretRight/>
                    </button>
                </CalendarActions>
            </CalendarHeader>
            <CalendarBody>
                <thead>
                    <tr>
                        {
                            shortWeekDays.map(
                                weekDay => 
                                    <th key={weekDay}>{weekDay}.</th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        calendarWeeks.map(({ week, days }) => {
                            return(

                                <tr key={week}>
                                    {
                                        days.map(({ date, disabled }) => {
                                            return(

                                                <td key={date.toString()}>
                                                    <CalendarDay 
                                                        onClick={() => onDateSelected(date.toDate())} 
                                                        disabled={disabled}
                                                    >
                                                        {date.get("date")}
                                                    </CalendarDay>
                                                </td>

                                            )
                                        })
                                    }
                                </tr>

                            )
                        })
                    }
                </tbody>
            </CalendarBody>
        </CalendarContainer>

    );

}
