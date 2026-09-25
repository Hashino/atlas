Build the smallest useful solution for Atlas
A smaller, better way for Atlas to handle service requests

Atlas Industrial Services is fictional. It is a 35-person company maintaining commercial equipment for business customers.

Requests arrive by email, WhatsApp and phone. A coordinator copies them into a spreadsheet and assigns jobs manually. Some urgent requests are missed. Customers repeatedly ask for status updates. The operations manager struggles to see what is overdue and who can take the next job.

Build the smallest convincing software solution you believe Atlas would actually pay for.

Choose the problem you think matters most. You are not expected to solve everything. The coordinator and operations manager should be able to see the value of your chosen workflow in a short demonstration.

Shared context and sample data

Treat the assessment clock as 09:00 on 1 October 2026, in Atlas's local time. This fictional clock is unrelated to the actual competition date. Atlas has three service technicians available for the demo: T1, T2 and T3. Skills, capacity, service targets and commercial assumptions have not been specified; state reasonable assumptions instead of presenting them as supplied facts.

You can use this small dataset or add clearly synthetic cases to test your solution:

| Request | Received | Channel | Customer | Message | Current record |
|---|---|---|---|---|---|
| R101 | Sep 30, 16:10 | Email | C01 | Cold-room unit keeps stopping. Stored goods could be affected. | Unassigned |

| R102 | Oct 1, 08:20 | WhatsApp | C02 | Can you confirm when someone is coming for yesterday's pump request? | Assigned T1; no visit time recorded |

| R103 | Sep 30, 11:00 | Phone | C03 | Routine inspection request for next week. | Open |

| R104 | Oct 1, 08:25 | Email | C01 | Following up on the cold-room fault reported yesterday. | New row; may duplicate R101 |

| R105 | Oct 1, 08:30 | Phone | C04 | Machine not working. Please call us. | No equipment identifier or urgency recorded |

| R106 | Sep 29, 14:00 | Email | C05 | We are waiting for the replacement part and an update. | Assigned T2; waiting for part |

| R107 | Sep 30, 15:00 | WhatsApp | C06 | Thanks, the unit is running again. | Still marked in progress under T3 |

| R108 | Oct 1, 08:40 | Email | C07 | Please send someone today for a pressure warning. | Unassigned; details need clarification |

This is context, not a feature checklist. You can focus on intake, triage, coordination, visibility, or another justified part of the workflow. Do not attempt real WhatsApp/email integrations or use real customer details. You may simulate them.
