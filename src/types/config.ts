/**
 * Type definitions for LLM configuration
 */

/**
 * Configuration options for Large Language Models (LLMs)
 * All properties are optional to allow partial configuration
 */
export interface LLMConfig {
  /** Controls randomness in response generation. Range: 0.0 to 2.0. Higher values make output more random */
  temperature?: number;
  /** Maximum number of tokens to generate in the completion. Range: 1 to 8192 */
  maxTokens?: number;
  /** Controls diversity via nucleus sampling. Range: 0.0 to 1.0. Higher values consider more possible tokens */
  topP?: number;
  /** How much to penalize new tokens based on their existing frequency. Range: -2.0 to 2.0 */
  frequencyPenalty?: number;
  /** How much to penalize new tokens based on whether they appear in the text so far. Range: -2.0 to 2.0 */
  presencePenalty?: number;
}
