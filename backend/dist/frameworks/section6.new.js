"use strict";
{
    number: 6,
        heading;
    'Sampling and Evidence',
        items;
    [
        {
            id: '6.1',
            number: '6.1',
            label: 'Evidence Retention',
            fields: [
                { id: 'evReposDesc', type: 'textarea', label: 'Describe the repositories where the evidence collected during this assessment is stored including the names of the repositories and how the data is secured.' },
                { id: 'evReposController', type: 'textarea', label: 'Identify the entity or entities who controls the evidence repositories.' },
                { id: 'evRetentionAck', type: 'radio', label: 'Indicate whether the entity or entities in control of the evidence repositories understands that all evidence from this assessment must be maintained for a minimum of 3 years and must be made available to PCI SSC upon request.', options: ['Yes', 'No'] },
                { id: 'evAssessorName', type: 'text', label: 'Identify the assessor who attests that all evidence has been gathered and stored as per the QSA Company’s evidence retention policy.' },
                { id: 'evAssessorNotes', type: 'textarea', label: 'Additional notes (optional)' }
            ]
        },
        {
            id: '6.2',
            number: '6.2',
            label: 'Sampling',
            fields: [
                { id: 'samplingUsed', type: 'radio', label: 'Indicate whether sampling is used.', options: ['Yes', 'No'] },
                { id: 'ifNoAssessor', type: 'text', label: 'If “No,” provide the name of the assessor who attests that every item in each population has been assessed.' },
                { id: 'ifYesRationale', type: 'textarea', label: 'If “Yes,” describe the sampling rationale(s) used for selecting sample sizes (for people, process evidence, technologies, devices, locations/sites, etc.).' },
                { id: 'ifYesRepresent', type: 'textarea', label: 'Describe how the samples are appropriate and representative of the overall populations.' },
                { id: 'standardizedControls', type: 'radio', label: 'Indicate whether standardized processes and controls are in place that provide consistency between each item in the samples—for example, automated system build processes, configuration change detection, etc.', options: ['Yes', 'No'] },
                { id: 'controlsValidated', type: 'textarea', label: 'If “Yes,” describe how the processes and controls were validated by the assessor to be in place and effective.' }
            ]
        },
        {
            id: '6.3',
            number: '6.3',
            label: 'Sample Sets for Reporting',
            fields: [
                {
                    id: 'sampleSets',
                    type: 'table-list',
                    label: 'Identify all sample sets used during testing. If sampling is used the assessor must identify the items in the population that were tested (for example, as “Sample Set-1”).',
                    minRows: 3,
                    columns: [
                        { id: 'refNum', label: 'Tested Sample Set Reference Number', width: '16%' },
                        { id: 'sampleType', label: 'Sample Type/ Description', width: '22%' },
                        { id: 'identifyItems', label: 'Identify All Items in the Sample Set', width: '28%' },
                        { id: 'selectionMethod', label: 'Selection Method', width: '18%' },
                        { id: 'totalSampled', label: 'Total Sampled', type: 'number', width: '8%' },
                        { id: 'totalPopulation', label: 'Total Population', type: 'number', width: '8%' }
                    ]
                }
            ]
        },
        {
            id: '6.4',
            number: '6.4',
            label: 'Documentation Evidence',
            fields: [
                {
                    id: 'docEvidence',
                    type: 'table-list',
                    label: 'Identify all evidence for any testing procedure requiring a review of documents such as policies, procedures, standards, records, inventories, vendor documentation, and diagrams.',
                    minRows: 4,
                    columns: [
                        { id: 'ref', label: 'Reference Number', width: '16%' },
                        { id: 'docName', label: 'Document Name (including version, if applicable)', width: '38%' },
                        { id: 'purpose', label: 'Document Purpose', width: '30%' },
                        { id: 'revisionDate', label: 'Document Revision Date (if applicable)', type: 'date', width: '16%' }
                    ]
                }
            ]
        },
        {
            id: '6.5',
            number: '6.5',
            label: 'Interview Evidence',
            fields: [
                {
                    id: 'interviewEvidence',
                    type: 'table-list',
                    label: 'Identify all evidence for testing procedures requiring an interview, such as interview notes.',
                    minRows: 3,
                    columns: [
                        { id: 'ref', label: 'Reference Number', width: '16%' },
                        { id: 'title', label: 'Title of Workpaper with Interview Notes', width: '34%' },
                        { id: 'topics', label: 'Topics Covered', width: '34%' },
                        { id: 'roles', label: 'Role(s) of Interviewee(s)', width: '16%' }
                    ]
                }
            ]
        },
        {
            id: '6.6',
            number: '6.6',
            label: 'Other Assessment Evidence',
            fields: [
                {
                    id: 'otherEvidence',
                    type: 'table-list',
                    label: 'Identify evidence for testing procedures that require observation of processes or examination of system evidence, such as configurations, settings, audit logs, access control lists, etc.',
                    minRows: 3,
                    columns: [
                        { id: 'ref', label: 'Reference Number', width: '16%' },
                        { id: 'title', label: 'Title of Workpaper or Evidence', width: '30%' },
                        { id: 'topics', label: 'Topics Covered or Evidence Collected', width: '38%' },
                        { id: 'sampleSetRef', label: 'Sample Set Reference Number from Table 6.3 (if applicable)', width: '16%' }
                    ]
                }
            ]
        }
    ];
}
//# sourceMappingURL=section6.new.js.map