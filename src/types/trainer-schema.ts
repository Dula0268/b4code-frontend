import { id } from 'date-fns/locale';
import { z } from 'zod';

const TrainerDetailsSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "Trainer name is required"),
    expertise: z.string().min(1, "Expertise is required"),
    email: z.string().min(1, "Email is required"),
    mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
});


export { TrainerDetailsSchema };