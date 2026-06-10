import { createHash } from "crypto";


export function generateSessionID(
    questionnaire_id: string,
    fingerprint: string,
    user_agent: string
):string{
  return createHash('sha256')
    .update(`${questionnaire_id}${fingerprint}${user_agent}`)
    .digest('hex')
}