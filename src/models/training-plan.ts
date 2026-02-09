import Trainer from "./trainer";

export default interface TrainingPlan {
    trainingCode: string,
    trainingType: string,
    trainingCoverageScope: string,
    trainingDetails: string,
    trainersDetails: Trainer[],
    trainingDate: string,
    trainingTime: string,
}
