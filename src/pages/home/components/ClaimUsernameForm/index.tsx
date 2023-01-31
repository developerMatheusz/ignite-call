import { Button, Text, TextInput } from "@ignite-ui/react";
import { ArrowRight } from "phosphor-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormAnnotation } from "./styles";
import { useRouter } from "next/router";

//regex é uma expressão regular que permite somente letras de A até Z
const claimUsernameFormSchema = z.object({
    username: z.string()
        .min(3, { message: "O usuário precisa ter pelo menos 3 letras." })
        .regex(/^([a-z\\-]+)$/i, { message: "O usuário pode ter apenas letras e hífens." })
        .transform(username => username.toLowerCase())
});

type ClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema>;

export function ClaimUsernameForm() {

    const { register, handleSubmit, formState: { errors } } = useForm<ClaimUsernameFormData>({
        resolver: zodResolver(claimUsernameFormSchema)
    });

    const router = useRouter();

    //Essa função é assíncrona e utiliza o await porque é um método que pode demorar para ser executado. Pois o usuário pode demorar para preencher o formulário.
    async function handleClaimUsername(data: any) {
        
        const { username } = data;

        await router.push(`/register?username=${username}`);

    }

    return(

        <>
            <Form as="form" onSubmit={handleSubmit(handleClaimUsername)}>
                <TextInput 
                    size="sm" 
                    prefix="ignite.com/" 
                    placeholder="seu-usuario" 
                    {...register("username")}
                />
                <Button 
                    size="sm" 
                    type="submit"
                >
                    Reservar
                    <ArrowRight/>
                </Button>
            </Form>
            <FormAnnotation>
                <Text size="sm">
                    {errors.username ? errors.username.message : "Digite o nome do usuário desejado"}
                </Text>
            </FormAnnotation>
        </>

    );

}
