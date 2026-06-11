export interface CategoryScoreCalculation{
    rawTotalScore: number;
    finalScore: number;
    percentage: number;
}

export interface SelectedAnswerScore{
    selectedValue: number;
    weight: number;
}

const MAX_SCORE_PER_QUESTION = 5;
const SCORE_MULTIPLIER = 2;

export function calculateCategoryScore(
    answers: SelectedAnswerScore[]
): CategoryScoreCalculation 
{
    const rawTotalScore=answers.reduce(
        (sum,answer)=> sum+ answer.selectedValue*answer.weight,
        0,
    );
    const finalScore=rawTotalScore*SCORE_MULTIPLIER;
    const maxPossibleScore=
    answers.reduce(
        (sum,answer)=> sum+ MAX_SCORE_PER_QUESTION*answer.weight,
        0,
    )* SCORE_MULTIPLIER;

    const percentage=finalScore/maxPossibleScore*100;
    return {
        rawTotalScore,
        finalScore,
        percentage,
    };
}