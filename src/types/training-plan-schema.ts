import { z } from 'zod';
import { TrainerDetailsSchema } from './trainer-schema';

const TrainingDataSchema = z.object({
    trainingCode: z.string().min(1, "Training code is required"),
    trainingType: z.string().min(1, "Training type is required"),
    trainingCoverageScope: z.string().min(1, "Coverage scope is required"),
    trainingDetails: z.string().min(1, "Training details are required"),
    trainersDetails: z.array(TrainerDetailsSchema),
    trainingDate: z.iso.date(),  // For date input
    trainingTime: z.iso.time()  // For time input
});

export { TrainingDataSchema };