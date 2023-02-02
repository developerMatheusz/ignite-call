import { api } from "@/lib/axios";
import { convertTimeStringToMinutes } from "@/utils/convert-time-string-to-minutes";
import { getWeekDays } from "@/utils/get-week-days";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Checkbox, Heading, MultiStep, Text, TextInput } from "@ignite-ui/react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { ArrowRight } from "phosphor-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Container, Header } from "../styles";
import { FormError, IntervalBox, IntervalsContainer, IntervalsDay, IntervalsInputs, IntervalsItem } from "./styles";

const timeIntervalsFormSchema = z.object({
    intervals: z.array(
        z.object({
            weekDay: z.number().min(0).max(6), 
            enable: z.boolean(), 
            startTime: z.string(), 
            endTime: z.string()
        })
    )
    .length(7)
    .transform(intervals => intervals.filter(interval => interval.enable))
    .refine(intervals => intervals.length > 0, {
        message: "Selecione pelo menos um dia da semana."
    })
    .transform(intervals => {
        return intervals.map(interval => {
            return {
                weekDay: interval.weekDay, 
                startTimeInMinutes: convertTimeStringToMinutes(interval.startTime), 
                endTimeInMinutes: convertTimeStringToMinutes(interval.endTime)
            }
        })
    })
    .refine(intervals => {
        return intervals.every(interval => interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes)
    }, {
        message: "O horário de término deve ser pelo menos 1 hora a mais do horário de início."
    })
});

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>;

type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>;

export default function TimeIntervals() {

    const { 
        register, 
        handleSubmit, 
        watch, 
        formState: { isSubmitting, errors }, 
        control
    } = useForm<TimeIntervalsFormInput>({
        resolver: zodResolver(timeIntervalsFormSchema), 
        defaultValues: {
            intervals: [
                { weekDay: 0, enable: false, startTime: "08:00", endTime: "18:00" }, 
                { weekDay: 1, enable: true, startTime: "08:00", endTime: "18:00" }, 
                { weekDay: 2, enable: true, startTime: "08:00", endTime: "18:00" }, 
                { weekDay: 3, enable: true, startTime: "08:00", endTime: "18:00" }, 
                { weekDay: 4, enable: true, startTime: "08:00", endTime: "18:00" }, 
                { weekDay: 5, enable: true, startTime: "08:00", endTime: "18:00" }, 
                { weekDay: 6, enable: false, startTime: "08:00", endTime: "18:00" }
            ]
        }
    });

    const weekDays = getWeekDays();
    const { fields } = useFieldArray({
        control, 
        name: "intervals"
    });
    const intervals = watch("intervals");
    const router = useRouter();

    async function handleSetTimeIntervals(data: any) {

        const { intervals } = data as TimeIntervalsFormOutput;

        await api.post("/users/time-intervals", {
            intervals
        });

        await router.push("/register/update-profile");

    }

    return(

        <>
            <NextSeo 
                title="Selecione sua disponibilidade | Ignite Call" noindex
            />
            <Container>
                <Header>
                    <Heading as="strong">
                        Quase lá
                    </Heading>
                    <Text>
                        Defina o intervalo de horários que você está disponível em cada dia da semana.
                    </Text>
                    <MultiStep size={4} currentStep={3}/>
                </Header>
                <IntervalBox 
                    as="form" 
                    onSubmit={handleSubmit(handleSetTimeIntervals)}
                >
                    <IntervalsContainer>
                        {
                            fields.map((field, index) => {
                                return(
                                    <IntervalsItem key={field.id}>
                                        <IntervalsDay>
                                            <Controller 
                                                name={`intervals.${index}.enable`} 
                                                control={control} 
                                                render={({ field }) => {
                                                    return(
                                                        <Checkbox 
                                                            onCheckedChange={
                                                                checked => {
                                                                    field.onChange(checked === true);
                                                                }
                                                            } 
                                                            checked={field.value} 
                                                        />
                                                    )
                                                }}
                                            />
                                            <Text>{weekDays[field.weekDay]}</Text>
                                        </IntervalsDay>
                                        <IntervalsInputs>
                                            <TextInput 
                                                size="sm" 
                                                type="time" 
                                                step={60} 
                                                disabled={intervals[index].enable === false} 
                                                {...register(`intervals.${index}.startTime`)}
                                            />
                                            <TextInput 
                                                size="sm" 
                                                type="time" 
                                                step={60} 
                                                disabled={intervals[index].enable === false} 
                                                {...register(`intervals.${index}.endTime`)}
                                            />
                                        </IntervalsInputs>
                                    </IntervalsItem>
                                );
                            })
                        }
                    </IntervalsContainer>
                    {
                        errors.intervals && (
                            <FormError size="sm">
                                {errors.intervals.message}
                            </FormError>
                        )
                    }
                    <Button type="submit" disabled={isSubmitting}>
                        Próximo passo
                        <ArrowRight/>
                    </Button>
                </IntervalBox>
            </Container>
        </>

    );

}
