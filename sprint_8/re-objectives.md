### Sprint Execution Guide: OSI Architecture Alignment

#### 1. Setup & Documentation Initialization

* **Task 1.1:** Create the following four files in the project root: `documentation.md`, `tasklist.md`, `log.md`, and `backlog.md`.
* **Task 1.2:** In `log.md`, initialize a table with headers: `[Date] | [Task Completed] | [OSI Layer Targeted] | [Status]`.
* **Task 1.3:** Maintain these files throughout the sprint; every code change or architecture decision must be recorded in the `log.md` and referenced in the `tasklist.md`.

#### 2. Phase 1: Audit & Mapping

* **Task 2.1:** Perform a codebase audit.
* **Task 2.2:** Map every existing functional module (chat, game logic, auth, WebSocket handlers) to one of the 7 OSI layers.
* **Task 2.3:** Document these mappings in the `Technical Specification` section of `documentation.md`.

#### 3. Phase 2: Modular Refactoring

* **Task 3.1:** Extract logic into separate modules: `ApplicationModule` (L7), `SessionModule` (L5), and `TransportModule` (L4).
* **Task 3.2:** Enforce strict boundaries: A module must **not** contain code belonging to a non-adjacent layer.
* **Task 3.3:** Implement the `transmit_message` interface for inter-layer communication.
* **Task 3.4:** Ensure that the Session layer handles no TCP/WebSocket logic; it must only pass payloads to the Transport layer.

#### 4. Phase 3: Encapsulation & Standardization

* **Task 4.1:** Define a standard Message Object structure: `{ header: {sender_id, session_id, timestamp}, payload: {data} }`.
* **Task 4.2:** Implement the `on_success` and `on_failure` callback handlers for the `transmit_message` API.
* **Task 4.3:** Integrate the Standardized Error Codes (`ERR_SESSION_EXPIRED`, `ERR_TRANSPORT_TIMEOUT`, etc.) into the `on_failure` logic.

#### 5. Phase 4: Verification & Handover

* **Task 5.1:** Conduct the "Layer Check" exercise:
* **Scenario:** UI shows "sent" but message is not received.
* **Requirement:** The agent must trace the error and identify whether it is an L4 (Transport) or L5 (Session) failure.


* **Task 5.2:** Verify that the UI displays a specific error message based on the error code returned from the layer, rather than a generic "failed" message.
* **Task 5.3:** Finalize all documentation and notify the user that the sprint is complete.

---

### Implementation Standards (Rules for the Agent)

1. **Strict Layering:** Never skip layers. L5 must talk to L4; it cannot jump to L3.
2. **Encapsulation:** Never pass raw data between layers; all data must be inside the defined Message Object.
3. **Traceability:** Every entry in `log.md` must clearly state the layer affected.
4. **Error Bubbling:** L4 errors must bubble up to L7 to trigger user alerts.

This line-by-line structure provides your agent with a direct checklist. Does this level of granularity meet your requirements for the next phase of the sprint?