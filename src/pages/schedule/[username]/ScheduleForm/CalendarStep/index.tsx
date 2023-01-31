import { Calendar } from "@/components";
import { Container, TimePicker, TimePickerHeader, TimePickerItem, TimePickerList } from "./styles";

export function CalendarStep() {

    return(

        <Container>
            <Calendar>
                <TimePicker>
                    <TimePickerHeader>
                    </TimePickerHeader>
                    <TimePickerList>
                        <TimePickerItem>
                            Opa
                        </TimePickerItem>
                    </TimePickerList>
                </TimePicker>
            </Calendar>
        </Container>

    );

}
