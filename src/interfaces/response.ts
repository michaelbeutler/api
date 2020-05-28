/**
 * The `IResponse` interface defines a strict response type.
 */
export default interface IResponse {
  /** HTTP Status for better visual. */
  status: number;
  /** Messsage to describe the response. */
  message: string;
  /** If the response returns a error message the code can help to identify the problem. */
  code?: number;
  /** Link to the documentation for this response. */
  documentation?: string;
  /** The Payload contains the requested content.
   * This could look like this:
   * ```json
   * {
   *     "count": 2,
   *     "todos": [
   *         {
   *             "id": 5,
   *             "text": "test5",
   *             "isDone": false,
   *             "url": "http://localhost:3000/todos/5"
   *         },
   *         {
   *             "id": 4,
   *             "text": "test4",
   *             "isDone": false,
   *             "url": "http://localhost:3000/todos/4"
   *         }
   *     ]
   * }
   * ```
   */
  payload?: object;
}
