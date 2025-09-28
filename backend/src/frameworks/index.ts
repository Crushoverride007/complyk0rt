// Framework structure templates for assessments
// NOTE: Kept minimal typing so runtime JSON is easy to return

export const frameworkStructures: Record<string, any> = {
  'PCI DSS 4.0': {
    code: 'pci-dss-4-0',
    parts: [
      {
        title: 'Part I: Assessment Overview',
        sections: [
          {
            number: 1,
            heading: 'Contact Information and Summary of Results',
            items: [
              {
                id: '1.1',
                number: '1.1',
                label: 'Contact Information',
                fields: [
                  {
                    id: 'assessedEntity',
                    type: 'form-table',
                    label: 'Assessed Entity',
                    rows: [
                      { id: 'companyAddress', type: 'text', label: 'Company address' },
                      { id: 'companyName', type: 'text', label: 'Company name' },
                      { id: 'dba', type: 'text', label: 'DBA (doing business as)' },
                      { id: 'mailingAddress', type: 'textarea', label: 'Mailing address' },
                      { id: 'website', type: 'text', label: 'Company main website' },
                      { id: 'contactName', type: 'text', label: 'Contact name' },
                      { id: 'contactTitle', type: 'text', label: 'Contact title' },
                      { id: 'contactPhone', type: 'text', label: 'Contact phone number' },
                      { id: 'contactEmail', type: 'text', label: 'Contact e-mail address' }
                    ]
                  },
                  {
                    id: 'isas',
                    type: 'table-list',
                    label: 'Assessed Entity Internal Security Assessors (ISAs)',
                    minRows: 1,
                    columns: [
                      { id: 'isaName', label: 'ISA name' }
                    ]
                  },
                  {
                    id: 'qsaCompany',
                    type: 'form-table',
                    label: 'Qualified Security Assessor Company',
                    rows: [
                      { id: 'qsaCompanyName', type: 'text', label: 'Company name' },
                      { id: 'qsaMailingAddress', type: 'textarea', label: 'Mailing address' },
                      { id: 'qsaWebsite', type: 'text', label: 'Company website' }
                    ]
                  },
                  {
                    id: 'leadQsa',
                    type: 'form-table',
                    label: 'Lead Qualified Security Assessor',
                    rows: [
                      { id: 'leadAssessorName', type: 'text', label: 'Lead Assessor name' },
                      { id: 'assessorPhone', type: 'text', label: 'Assessor phone number' },
                      { id: 'assessorEmail', type: 'text', label: 'Assessor e-mail address' },
                      { id: 'assessorCertificate', type: 'text', label: 'Assessor certificate number' }
                    ]
                  },
                  {
                    id: 'associateQSAs',
                    type: 'table-list',
                    label: 'Associate QSAs involved (if none, mark Not Applicable)',
                    minRows: 1,
                    columns: [
                      { id: 'associateQsaName', label: 'Associate QSA name' },
                      { id: 'associateQsaMentor', label: 'Associate QSA mentor name' }
                    ]
                  },
                  {
                    id: 'otherAssessors',
                    type: 'table-list',
                    label: 'Other assessors involved (if any)',
                    minRows: 1,
                    columns: [
                      { id: 'assessorName', label: 'Assessor name' },
                      { id: 'assessorCertificateNumber', label: 'Assessor certificate number' }
                    ]
                  },
                  {
                    id: 'qaReviewer',
                    type: 'form-table',
                    label: 'Assessor Quality Assurance (QA) Primary Reviewer for this report',
                    rows: [
                      { id: 'qaReviewerName', type: 'text', label: 'QA reviewer name' },
                      { id: 'qaReviewerPhone', type: 'text', label: 'QA reviewer phone number' },
                      { id: 'qaReviewerEmail', type: 'text', label: 'QA reviewer e-mail address' },
                      { id: 'qaReviewerCredential', type: 'text', label: 'QA reviewer PCI credentials/certificate number' }
                    ]
                  }
                ]
              },
              {
                id: '1.2',
                number: '1.2',
                label: 'Date and Timeframe of Assessment',
                fields: [
                  { id:'dateOfReport', type:'date', label:'Date of Report' },
                  { id:'dateAssessmentBegan', type:'date', label:'Date assessment began' },
                  { id:'dateAssessmentEnded', type:'date', label:'Date assessment ended' },
                  { id:'onsiteDates', type:'text', label:'Identify the date(s) spent onsite at the assessed entity' }
                ]
              },
              {
                id: '1.3',
                number: '1.3',
                label: 'Remote Assessment Activities',
                fields: [
                  { id:'remoteTestingExtent', type:'radio', label:'To what extent were remote testing methods used for this assessment?', options:['All testing was performed onsite','A combination of onsite and remote testing methods was used','All testing was performed remotely'] },
                  { id:'remoteTestingReason', type:'textarea', label:'If remote testing was used for any part of the assessment, briefly describe why onsite testing was not feasible or practical.' }
                ]
              },
              {
                id: '1.4',
                number: '1.4',
                label: 'Additional Services Provided by QSA Company',
                fields: [
                  
                  { id:'desc1_4', type:'alert', variant:'info', label:'Description', help:'The PCI SSC Qualification Requirements for Qualified Security Assessors (QSA) includes content on “Independence,” which specifies requirements for assessor disclosure of services and/or offerings that could reasonably be viewed to affect the independence of assessment. Complete the section below after reviewing the relevant portions of the Qualification Requirements to ensure responses are consistent with documented obligations.' },{ id:'providedConsultationForCustomizedApproach', type:'radio', label:'Indicate whether the QSA Company provided any consultation on the development or implementation of controls used for the Customized Approach.', options:['Yes','No'] },
                  { id:'providedConsultationNote', type:'alert', variant:'warning', label:'Note', help:'This does not apply to the assessment of the Customized Approach.' },
                  { id:'consultationDescription', type:'textarea', label:'If "Yes," describe the nature of the consultation.', when: { field: 'providedConsultationForCustomizedApproach', equals: 'Yes' } },
                  { id:'discloseProductsServices', type:'textarea', label:'Disclose all products or services provided to the assessed entity by the QSA Company that are not listed above and that were reviewed during this assessment or could reasonably be viewed to affect independence of assessment.' },
                  { id:'independenceMitigations', type:'textarea', label:'Describe efforts made to ensure no conflict of interest resulted from the above-mentioned products and services provided by the QSA Company.' }
                ]
              },
              {
                id: '1.5',
                number: '1.5',
                label: 'Use of Subcontractors',
                fields: [
                  
                  { id:'desc1_5', type:'alert', variant:'info', label:'Description', help:'Indicate whether any assessment activities were subcontracted to another Assessor Company. Responses should align with QSA Qualification Requirements and program obligations.' },{ id:'subcontractorsUsed', type:'radio', label:'Indicate whether any assessment activities were subcontracted to another Assessor Company.', options:['Yes','No'] },
                  { id:'subcontractorNote', type:'alert', variant:'warning', label:'Note', help:'The use of subcontractors must conform with the requirements defined in the Qualification Requirements for Qualified Security Assessors (QSA) and Qualified Security Assessor Program Guide.' },
                  { id:'subcontractorDetails', type:'textarea', label:'If yes, identify the Assessor Company(s) utilized during the assessment.', when: { field: 'subcontractorsUsed', equals: 'Yes' } }
                ]
              },
              {
                id: '1.6',
                number: '1.6',
                label: 'Additional Information/Reporting',
                fields: [
                  { id:'rocConsecutiveYears', type:'number', label:'Identify the number of consecutive years (including the current year) the QSA Company has issued ROCs for this entity.' }
                ]
              },
              {
                id: '1.7',
                number: '1.7',
                label: 'Overall Assessment Result',
                fields: [
                  
                  { id:'instructions1_7', type:'alert', variant:'info', label:'Instructions', help:'Indicate below whether a full or partial assessment was completed. Select only one.' },{ id:'assessmentCompletion', type:'radio', label:'Indicate whether a full or partial assessment was completed.', options:['Full Assessment | All requirements have been assessed and therefore no requirements were marked as Not Tested.', 'Partial Assessment | One or more requirements have not been assessed and were therefore marked as Not Tested. Any requirement not assessed is noted as Not Tested in section 1.8.1 below.'] },
                  { id:'overallAssessmentResult', type:'radio', label:'Overall Assessment Result (Select only one)', options:['Compliant | All sections of the PCI DSS ROC are complete, and all assessed requirements are marked as being either In Place or Not Applicable, resulting in an overall COMPLIANT rating; thereby the assessed entity has demonstrated compliance with all PCI DSS requirements except those noted as Not Tested above.', 'Non-Compliant | Not all sections of the PCI DSS ROC are complete, or one or more requirements are marked as Not in Place, resulting in an overall NON-COMPLIANT rating; thereby the assessed entity has not demonstrated compliance with PCI DSS requirements.', 'Compliant but with Legal Exception | One or more assessed requirements in the ROC are marked as Not in Place due to a legal restriction that prevents the requirement from being met and all other assessed requirements are marked as being either In Place or Not Applicable, resulting in an overall COMPLIANT BUT WITH LEGAL EXCEPTION rating, thereby the assessed entity has demonstrated compliance with all PCI DSS requirements except those noted as Not Tested above or as Not in Place due to a legal restriction.' ] }
                ]
              },
              {
                id: '1.8',
                number: '1.8',
                label: 'Summary of Assessment',
                fields: [
                  { id:'summaryHeading', type:'heading', label:'1.8.1 Summary of Assessment Findings and Methods' },
  { id:'summaryIntro', type:'alert', variant:'info', label:'Instructions', help:'Indicate all the findings and assessment methods within each PCI DSS principal requirement. Select all that apply. For example, In Place and Not Applicable must both be selected for Requirement 1 if there is at least one sub-requirement marked In Place and one sub-requirement marked Not Applicable. The columns for Compensating Controls and Customized Approach must be selected if there is at least one sub-requirement within the principal requirement that utilizes the respective method. For example, Compensating Control and Customized Approach must both be checked if at least one sub-requirement utilizes Compensating Controls and at least one sub requirement utilizes a Customized Approach. If neither Compensating Controls nor Customized Approach are used, then leave both blank.' },
                  { id:'summaryMatrix', type:'checkbox-table', label:'', columns:[
                    { id:'inPlace', label:'In Place', group:'Assessment Finding' },
                    { id:'notApplicable', label:'Not Applicable', group:'Assessment Finding' },
                    { id:'notTested', label:'Not Tested', group:'Assessment Finding' },
                    { id:'notInPlace', label:'Not in Place', group:'Assessment Finding' },
                    { id:'compensatingControl', label:'Compensating Control', group:'Select If Below Method(s) Was Used' },
                    { id:'customizedApproach', label:'Customized Approach', group:'Select If Below Method(s) Was Used' }
                  ], rows:[
                    { id:'r1', label:'Requirement 1:' }, { id:'r2', label:'Requirement 2:' }, { id:'r3', label:'Requirement 3:' }, { id:'r4', label:'Requirement 4:' }, { id:'r5', label:'Requirement 5:' }, { id:'r6', label:'Requirement 6:' }, { id:'r7', label:'Requirement 7:' }, { id:'r8', label:'Requirement 8:' }, { id:'r9', label:'Requirement 9:' }, { id:'r10', label:'Requirement 10:' }, { id:'r11', label:'Requirement 11:' }, { id:'r12', label:'Requirement 12:' }, { id:'a1', label:'Appendix A1:' }, { id:'a2', label:'Appendix A2:' }, { id:'a3', label:'Appendix A3:' }
                  ] },
  { id:'summarySubIntro', type:'alert', variant:'info', label:'Instructions', help:'In the sections below identify the sub-requirements with the following results and assessment methods. If there are none, enter "Not Applicable."' },
  { id:'summarySubNote', type:'alert', variant:'warning', label:'Note', help:'Natural grouping of requirements is allowed (for example, Req. 3, 1.1, 1.1.1, 1.1.2, or 1.2.1 through 1.2.3, etc.) to reduce the number of individual requirements listed.' },
                  { id:'summaryNoteHeading', type:'heading', label:'Identify sub-requirements with the following results/methods' },
                  { id:'naNotes', type:'textarea', label:'Not Applicable' },
                  { id:'ntNotes', type:'textarea', label:'Not Tested' },
                  { id:'niplrNotes', type:'textarea', label:'Not in Place Due to a Legal Restriction' },
                  { id:'nipnlrNotes', type:'textarea', label:'Not in Place Not Due to a Legal Restriction' },
                  { id:'ccNotes', type:'textarea', label:'Compensating Control' },
                  { id:'caNotes', type:'textarea', label:'Customized Approach' }
]
              }
            ],
          },
          {
            number: 2,
            heading: 'Business Overview',
            items: [
              {
                id: '2.1',
                number: '2.1',
                label: "Description of the Entity's Payment Card Business",
                fields: [
                  { id:'intro', type:'heading', label:"Provide an overview of the entity's payment card business, including:" },
                  { id:'natureBusiness', type:'textarea', label:"Describe the nature of the entity's business (what kind of work they do, etc.).", help:"Note: This is not intended to be a cut-and-paste from the entity's website but should be a tailored description that shows the assessor understands the business of the entity being assessed." },
                  { id:'storeProcessTransmit', type:'textarea', label:"Describe the entity's business, services, or functions that store, process, or transmit account data." },
                  { id:'servicesImpactSecurity', type:'textarea', label:"Describe any services or functions that the entity performs that could impact the security of account data.", help:'For example, merchant web site payment redirects or if the entity provides managed services.' },
                  { id:'paymentChannels', type:'checkbox-table', label:'Identify the payment channels the entity utilizes.', columns:[
                    { id:'cardPresent', label:'Card-Present' },
                    { id:'moto', label:'Mail Order/Telephone Order (MOTO)' },
                    { id:'ecommerce', label:'E-Commerce' }
                  ], rows:[ { id:'uses', label:'' } ] },
                  { id:'otherDetails', type:'textarea', label:'Other details, if applicable:' }
                ]
              }
            ]
          },
          {
            number: 3,
            heading: 'Description of Scope of Work and Approach Taken',
            items: [
              {
                id: '3.1',
                number: '3.1',
                label: 'Assessor’s Validation of Defined Scope Accuracy',
                fields: [
                  { id:'instructions3_1', type:'alert', variant:'info', label:'Instructions', help:'Describe how the assessor validated the accuracy of the defined PCI DSS scope for the assessment. As noted in PCI DSS Requirements and Testing Procedures, the entity must retain documentation showing how PCI DSS scope was determined (per Requirement 12.5.2). For each PCI DSS assessment, the assessor validates that the assessment scope is accurately defined and documented.' },
                  {
                    id: 'scopeValidation',
                    type: 'form-table',
                    label: 'Assessor’s Validation of Defined Scope Accuracy',
                    help: 'Describe how the assessor validated the accuracy of the defined PCI DSS scope for the assessment.',
                    rows: [
                      { id: 'diffFrom12_5', type: 'textarea', label: "Describe how the assessor's evaluation of scope differs from the assessed entity's evaluation of scope as documented in Requirement 12.5. If no difference was identified, mark as 'Not Applicable.'" },
                      { id: 'assessorAttestor', type: 'textarea', label: 'Provide the name of the assessor who attests that:', help: '• They have performed an independent evaluation of the scope of the assessed entity’s PCI DSS environment.\n• If the assessor’s evaluation identified areas of scope not included in the assessed entity’s documented scope, the assessed entity has updated their scoping documentation.\n• The scope of the assessment is complete and accurate to the best of the assessor’s knowledge.' },
                      { id: 'exclusions', type: 'textarea', label: 'Describe any business functions, locations, payment channels, or other areas of scope that were excluded from the assessment, including:', help: '• What was excluded.\n• Why it was excluded.\n• If it was included in a separate assessment.\n\nIf none, mark as “Not Applicable.”' },
                      { id: 'scopeReduction', type: 'textarea', label: 'Identify any factors that resulted in reducing or limiting scope (for example, segmentation of the environment, use of a P2PE solution, etc.). If none, mark as “Not Applicable.”' },
                      { id: 'saqEligibility', type: 'textarea', label: 'Describe any use of SAQ eligibility criteria in determining applicability of PCI DSS requirements for this assessment, including:', help: '• The type of SAQ applied.\n• The eligibility criteria for the applicable SAQ.\n• How the assessor verified that the assessed entity’s environment meets the eligibility criteria.\n\nNote: The only SAQ for service providers is SAQ D for Service Providers. All other SAQs are for merchants only.\n\nIf not used, mark as “Not Applicable.”' },
                      { id: 'additionalInfo', type: 'textarea', label: 'Additional information, if applicable' }
                    ]
                  }
                ]
              },
              {
                id: '3.2',
                number: '3.2',
                label: 'Segmentation',
                fields: [
                  { id:'instructions3_2', type:'alert', variant:'info', label:'Instructions', help:'Indicate whether the assessed entity has used segmentation to reduce the scope of the assessment.\nNote: An environment with no segmentation is considered a “flat” network where all systems are considered to be in scope.' },
                  { id:'segmentationUsed', type:'radio', label:'Indicate whether the assessed entity has used segmentation to reduce the scope of the assessment', options:['Yes','No'] },
                  {
                    id:'segmentationDetails',
                    type:'form-table',
                    label:'Segmentation details',
                    rows: [
                      { id:'ifNoAttestor', type:'text', label:'If “No”, provide the name of the assessor who attests that the entire network has been included in the scope of the assessment.', when: { fieldId:'segmentationUsed', equals:'No' } },
                      { id:'descImplementation', type:'textarea', label:'If “Yes”, describe how the segmentation is implemented, including the technologies and processes used.', when: { fieldId:'segmentationUsed', equals:'Yes' } },
                      { id:'outOfScopeEnvs', type:'textarea', label:'If “Yes”, describe the environments that were confirmed to be out of scope as a result of the segmentation methods.', when: { fieldId:'segmentationUsed', equals:'Yes' } },
                      { id:'yesAttestor', type:'text', label:'If “Yes”, provide the name of the assessor who attests that the segmentation was verified to be adequate to reduce the scope of the assessment and that the technologies/processes used to implement segmentation were included in this PCI DSS assessment.', when: { fieldId:'segmentationUsed', equals:'Yes' } }
                    ]
                  }
                ]
              },
              {
                id: '3.3',
                number: '3.3',
                label: 'PCI SSC Validated Products and Solutions',
                fields: [
                  { id:'instructions3_3', type:'alert', variant:'info', label:'Instructions', help:'For purposes of this document, “Lists of Validated Products and Solutions” means the lists of validated products, solutions, and/or components appearing on the PCI SSC website (www.pcisecuritystandards.org). Examples include: 3DS Software Development Kits, Approved PTS Devices, Validated Payment Software, Point to Point Encryption (P2PE) solutions, Software-Based PIN Entry on COTS (SPoC) solutions, Contactless Payments on COTS (CPoC) solutions, and Mobile Payment on COTS (MPoC) products.' },
                  { id:'usesValidatedProducts', type:'radio', label:'Indicate whether the assessed entity uses one or more PCI SSC validated products or solutions', options:['Yes','No'] },
                  { id:'validatedProductsHeading', type:'heading', label:'If “Yes,” provide the following regarding items the organization uses from PCI SSC’s Lists of Validated Products and Solutions', when: { fieldId:'usesValidatedProducts', equals:'Yes' } },
                  { id:'validatedProductsIntroInput', type:'text', label:'', when: { fieldId:'usesValidatedProducts', equals:'Yes' } },
                  {
                    id:'validatedProducts',
                    type:'table-list',
                    label:'',
                    minRows: 5,
                    columns: [
                      { id:'name', label:'Name of PCI SSC validated product or solution' },
                      { id:'version', label:'Version of product or solution' },
                      { id:'standard', label:'PCI SSC Standard to which product or solution was validated' },
                      { id:'listingRef', label:'PCI SSC listing reference number' },
                      { id:'expiryDate', label:'Expiry date of listing', type:'date' }
                    ]
                  },
                  {
                    id:'validatedAssessorAttestor',
                    type:'form-table',
                    label:'Attestations and comments',
                    rows: [
                      { id:'manualAttestor', type:'textarea', label:'Provide the name of the assessor who attests that they have read the instruction manual associated with each of the solution(s) listed above and confirmed that the merchant has implemented the solution per the instructions and detail in the instruction manual.' },
                      { id:'additionalComments', type:'textarea', label:'Any additional comments or findings the assessor would like to include, if applicable.' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            number: 4,
            heading: 'Details about Reviewed Environment',
            items: [
              {
                id: '4.1',
                number: '4.1',
                label: 'Network Diagrams',
                fields: [
                  { id:'ndIntro', type:'alert', variant:'warning', label:'Provide one or more network diagrams that:', help:'• Shows all connections between the CDE and other networks, including any wireless networks.\n• Is accurate and up to date with any changes to the environment.\n• Illustrates all network security controls that are defined for connection points between trusted and untrusted networks.\n• Illustrates how system components storing cardholder data are not directly accessible from the untrusted networks.\n• Includes the techniques (such as intrusion-detection systems and/or intrusion-prevention systems) that are in place to monitor all traffic:\n– At the perimeter of the cardholder data environment.\n– At critical points in the cardholder data environment.'  },
                  { id:'ndUpload', type:'dropzone', label:'Insert Diagrams', accept:'image/*,application/pdf', multiple:true },
                  { id:'ndComments', type:'textarea', label:'Comments (optional)' }
                ]
              },
              {
                id: '4.2',
                number: '4.2',
                label: 'Account Dataflow Diagrams',
                fields: [
                  { id:'adIntro', type:'alert', variant:'warning', label:'Provide one or more dataflow diagrams that:', help:'• Shows all account data flows across systems and networks.\n• Are accurate and up to date.'  },
                  { id:'adUpload', type:'dropzone', label:'Insert Diagrams', accept:'image/*,application/pdf', multiple:true },
                  { id:'adFlowsHeading', type:'heading', label:'4.2.1 Description of Account Data Flows' },
                  { id:'adFlowsNote', type:'alert', variant:'warning', label:'Note', help:'These data flows must be described in detail in the sections of the table that follow.'  },
                  { id:'adFlowsParticipates', type:'checkbox-table', label:'Identify in which of the following account data flows the assessed entity participates:', columns:[
                    { id:'authorization', label:'Authorization' },
                    { id:'capture', label:'Capture' },
                    { id:'settlement', label:'Settlement' },
                    { id:'chargeback', label:'Chargeback/Dispute' },
                    { id:'refunds', label:'Refunds' },
                    { id:'other', label:'Other' }
                  ], rows:[ { id:'participates', label:'' } ] },
                  { id:'adFlowsTable', type:'table-list', label:'Identify and describe all data flows', minRows:3, columns:[
                    { id:'flowName', label:'Account data flows (e.g., account data flow 1, account data flow 2)', width:'40%' },
                    { id:'description', label:'Description (include the type of account data)', width:'60%' }
                  ] }
                ]
              },
              {
                id: '4.3',
                number: '4.3',
                label: 'Storage of Account Data',
                fields: [
                  { id:'sadNote', type:'alert', variant:'warning', label:'Note', help:'The list of files and tables that store account data in the table below must be supported by an inventory created (or obtained from the assessed entity) and retained by the assessor in the workpapers.'  },
                  { id:'sadTable', type:'table-list', label:'Identify all databases, tables, and files storing account data', minRows:4, columns:[
                    { id:'dataStore', label:'Data Store' },
                    { id:'fileOrTable', label:'File Name(s), Table Name(s) and/or Field Names' },
                    { id:'dataElements', label:'Account Data Elements Stored' },
                    { id:'howSecured', label:'How Data Is Secured' },
                    { id:'howLogged', label:'How Access to Data Stores Is Logged' }
                  ] },
                  { id:'storageSADHeading', type:'heading', label:'4.3.1 Storage of SAD' },
                  { id:'sad431Instr', type:'alert', variant:'info', label:'Instructions', help:'If SAD is stored, complete the following.' },
                  { id:'sad431Note', type:'alert', variant:'warning', label:'Note', help:'Anywhere SAD is stored should be documented in the table in 4.3.' },
                  { id:'sadPostAuth', type:'radio', label:'Indicate whether SAD is stored post authorization', options:['Yes','No'] },
                  { id:'sadIssuerFunctions', type:'radio', label:'Indicate whether SAD is stored as part of issuer functions', options:['Yes','No'] }
                ]
              },
              {
                id: '4.4',
                number: '4.4',
                label: 'In-Scope Third-Party Service Providers (TPSPs)',
                fields: [
                  { id:'tpspExample', type:'alert', variant:'info', label:'Example', help:'1 For example, PAN, expiry date, providing support via remote access, and so on.\n2 For example, third-party storage, transaction processing, custom software development, and so on.' },
                  { id:'tpsps', type:'table-list', label:'Provide the following for each third-party service provider', minRows:4, columns:[
                    { id:'companyName', label:'Company Name', width:'18%' },
                    { id:'dataShared', label:'Identify what account data is shared or, if not shared, how the organization could impact the security of account data', width:'26%' },
                    { id:'purpose', label:'Describe the purpose for utilizing the service provider', width:'22%' },
                    { id:'assessedAgainstPCI', label:'Assessed against PCI DSS?', type:'radio', options:['Yes','No'], width:'10%' },
                    { id:'aocDate', label:'AOC Date (If Yes)', type:'date', width:'12%' },
                    { id:'aocVersion', label:'PCI DSS Version', width:'12%' },
                    { id:'includedInAssessment', label:'If No, included in this assessment?', type:'radio', options:['Yes','No'], width:'10%' }
                   ] },


                ]
              },
              {
                id: '4.5',
                number: '4.5',
                label: 'In-Scope Networks',
                fields: [
                  { id:'netNote', type:'alert', variant:'warning', label:'Note', help:'This section must align with networks identified on the network diagram.'  },
                  { id:'inScopeNetworks', type:'table-list', label:'Describe all networks that store, process, and/or transmit Account Data:', minRows:3, columns:[
                    { id:'networkName', label:'Network Name (In Scope)', width:'32%' },
                    { id:'networkType', label:'Type of Network', width:'28%' },
                    { id:'function', label:'Function/Purpose of Network', width:'40%' }
                  ] },
                  { id:'inScopeNonAD', type:'table-list', label:'Describe all networks that do not store, process, and/or transmit Account Data but are still in scope:', minRows:3, columns:[
                    { id:'networkName', label:'Network Name (In Scope)', width:'32%' },
                    { id:'networkType', label:'Type of Network', width:'28%' },
                    { id:'function', label:'Function/Purpose of Network', width:'40%' }
                  ] }
                ]
              },
              { id:'4.6', number:'4.6', label:'In-Scope Locations/Facilities',
  fields:[
    { id:'locDesc', type:'alert', variant:'info', label:'Instructions', help:'Identify and provide details for all types of physical locations/facilities (for example, retail locations, corporate offices, data centers, call centers and mail rooms) in scope. Add rows as needed.' },
    { id:'locationsFacilities', type:'table-list', label:'Locations / Facilities', minRows:4, columns:[
      { id:'facilityType', label:'Facility Type (e.g., datacenter, corporate office, call center, mail processing facility, etc.)', width:'40%' },
      { id:'totalLocations', label:'Total Number of Locations (how many of this type are in scope)', type:'number', width:'20%' },
      { id:'facilityLocations', label:'Location(s) of Facility (e.g., city, country)', width:'40%' }
    ] }
  ]
},
{ id:'4.7', number:'4.7', label:'In-Scope System Component Types',
  fields:[
    { id:'compDesc', type:'alert', variant:'info', label:'Instructions', help:'Identify all types of system components in scope. Refer to PCI DSS v4.x section 4 Scope of PCI DSS Requirements for examples that include, but are not limited to, system component types in scope. For each item, even if it resides with other system components, list each component with different roles, vendors, or make/model/version on separate rows. Add rows as needed.' },
    { id:'componentTypes', type:'table-list', label:'System Component Types', help:'1 For example, application, firewall, server, IDS, anti-malware software, database, and so on.\n2 How many system components of this type are in scope.', minRows:4, columns:[
      { id:'componentType', label:'Type of System Component (e.g., application, firewall, server, IDS, anti-malware software, database, etc.)', width:'28%' },
      { id:'totalComponents', label:'Total Number of System Components (in scope)', type:'number', width:'16%' },
      { id:'vendor', label:'Vendor', width:'16%' },
      { id:'productNameVersion', label:'Product Name and Version', width:'20%' },
      { id:'roleDescription', label:'Role/Function Description', width:'20%' }
    ] }
  ]
}],
          },
          {
            number: 5,
            heading: 'Quarterly Scan Results',
            items: [
              { id: '5.1', number: '5.1', label: 'Quarterly External Scan Results', fields: [
                { id:'extInstr', type:'alert', variant:'info', label:'Instructions', help:'Identify each quarterly ASV scan performed within the last 12 months in the table below. Refer to PCI DSS Requirement 11.3.2 for information about initial PCI DSS assessments against the ASV scan requirements.' },
                { id:'extScans', type:'table-list', label:'Identify each quarterly ASV scan performed within the last 12 months', minRows:4, columns:[
                  { id:'date', label:'Date of the Scan(s)', type:'date', width:'18%' },
                  { id:'asvName', label:'Name of ASV that Performed the Scan', width:'28%' },
                  { id:'failedInitial', label:'Failed initial scan? (Yes/No)', type:'radio', options:['Yes','No'], width:'14%' },
                  { id:'rescanDates', label:'If Failed: Date(s) of re-scans showing vulnerabilities corrected', width:'40%' }
                ] },
                { id:'isInitialExternal', type:'radio', label:'Indicate whether this is the assessed entity’s initial PCI DSS assessment against the ASV scan requirements', options:['Yes','No'] },
                { id:'initialExternalDoc', type:'text', label:'If yes, identify the document verified that includes policies/procedures requiring scanning at least once every three months going forward' },
                { id:'externalComments', type:'textarea', label:'Assessor comments, if applicable' }
              ] },
              { id: '5.2', number: '5.2', label: 'Attestations of Scan Compliance', fields: [
                { id:'ascInstr', type:'alert', variant:'info', label:'Instructions', help:'The scans must cover all externally accessible (Internet-facing) IP addresses in existence at the entity, in accordance with the PCI DSS Approved Scanning Vendors (ASV) Program Guide.' },
                { id:'attestationCompleted', type:'radio', label:'Indicate whether the ASV and the assessed entity completed the Attestations of Scan Compliance, confirming that all externally accessible (Internet-facing) IP addresses in existence at the entity were appropriately scoped for the ASV scans.', options:['Yes','No'] },
                { id:'attestationComments', type:'textarea', label:'Comments (optional)' }
              ] },
              { id: '5.3', number: '5.3', label: 'Quarterly Internal Scan Results', fields: [
                { id:'intScans', type:'table-list', label:'Identify each quarterly internal vulnerability scan performed within the last 12 months', minRows:4, columns:[
                  { id:'date', label:'Date of the Scan(s)', type:'date', width:'18%' },
                  { id:'authenticated', label:'Was the scan performed via authenticated scanning? (Yes/No)', type:'radio', options:['Yes','No'], width:'22%' },
                  { id:'highRiskFound', label:'Any high-risk or critical vulnerabilities per the entity’s rankings (Req. 6.3.1)? (Yes/No)', type:'radio', options:['Yes','No'], width:'22%' },
                  { id:'rescanDates', label:'If high-risk/critical found: Date(s) of re-scans showing vulnerabilities corrected', width:'38%' }
                ] },
                { id:'isInitialInternal', type:'radio', label:'Indicate if this is the assessed entity’s initial PCI DSS assessment against the internal scan requirements', options:['Yes','No'] },
                { id:'initialInternalDoc', type:'text', label:'If yes, identify the document verified that includes policies/procedures requiring scanning at least once every three months going forward' },
                { id:'internalComments', type:'textarea', label:'Assessor comments, if applicable' }
              ] }
            ]
          }
        ]
      },
      {
        title: 'Part II: Sampling and Evidence, Findings and Observations',
        sections: [
          {
            number: 6,
            heading: 'Sampling and Evidence',
            items: [
              {
                id: '6.1',
                number: '6.1',
                label: 'Evidence Retention',
                fields: [
                  { id:'evReposDesc', type:'textarea', label:'Describe the repositories where the evidence collected during this assessment is stored including the names of the repositories and how the data is secured.' },
                  { id:'evReposController', type:'textarea', label:'Identify the entity or entities who controls the evidence repositories.' },
                  { id:'evRetentionAck', type:'radio', label:'Indicate whether the entity or entities in control of the evidence repositories understands that all evidence from this assessment must be maintained for a minimum of 3 years and must be made available to PCI SSC upon request.', options:['Yes','No'] },
                  { id:'evAssessorName', type:'text', label:'Identify the assessor who attests that all evidence has been gathered and stored as per the QSA Company’s evidence retention policy.' },
                  { id:'evAssessorNotes', type:'textarea', label:'Additional notes (optional)' }
                ]
              },
              {
                id: '6.2',
                number: '6.2',
                label: 'Sampling',
                fields: [
                  { id:'samplingUsed', type:'radio', label:'Indicate whether sampling is used.', options:['Yes','No'] },
                  { id:'ifNoAssessor', type:'text', label:'If “No,” provide the name of the assessor who attests that every item in each population has been assessed.' },
                  { id:'ifYesRationale', type:'textarea', label:'If “Yes,” describe the sampling rationale(s) used for selecting sample sizes (for people, process evidence, technologies, devices, locations/sites, etc.).' },
                  { id:'ifYesRepresent', type:'textarea', label:'Describe how the samples are appropriate and representative of the overall populations.' },
                  { id:'standardizedControls', type:'radio', label:'Indicate whether standardized processes and controls are in place that provide consistency between each item in the samples—for example, automated system build processes, configuration change detection, etc.', options:['Yes','No'] },
                  { id:'controlsValidated', type:'textarea', label:'If “Yes,” describe how the processes and controls were validated by the assessor to be in place and effective.' }
                ]
              },
              {
                id: '6.3',
                number: '6.3',
                label: 'Sample Sets for Reporting',
                fields: [
                  {
                    id:'sampleSets',
                    type:'table-list',
                    label:'Identify all sample sets used during testing. If sampling is used the assessor must identify the items in the population that were tested (for example, as “Sample Set-1”).',
                    minRows: 3,
                    columns: [
                      { id:'refNum', label:'Tested Sample Set Reference Number', width:'16%' },
                      { id:'sampleType', label:'Sample Type/ Description', width:'22%' },
                      { id:'identifyItems', label:'Identify All Items in the Sample Set', width:'28%' },
                      { id:'selectionMethod', label:'Selection Method', width:'18%' },
                      { id:'totalSampled', label:'Total Sampled', type:'number', width:'8%' },
                      { id:'totalPopulation', label:'Total Population', type:'number', width:'8%' }
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
                    id:'docEvidence',
                    type:'table-list',
                    label:'Identify all evidence for any testing procedure requiring a review of documents such as policies, procedures, standards, records, inventories, vendor documentation, and diagrams.',
                    minRows: 4,
                    columns: [
                      { id:'ref', label:'Reference Number', width:'16%' },
                      { id:'docName', label:'Document Name (including version, if applicable)', width:'38%' },
                      { id:'purpose', label:'Document Purpose', width:'30%' },
                      { id:'revisionDate', label:'Document Revision Date (if applicable)', type:'date', width:'16%' }
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
                    id:'interviewEvidence',
                    type:'table-list',
                    label:'Identify all evidence for testing procedures requiring an interview, such as interview notes.',
                    minRows: 3,
                    columns: [
                      { id:'ref', label:'Reference Number', width:'16%' },
                      { id:'title', label:'Title of Workpaper with Interview Notes', width:'34%' },
                      { id:'topics', label:'Topics Covered', width:'34%' },
                      { id:'roles', label:'Role(s) of Interviewee(s)', width:'16%' }
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
                    id:'otherEvidence',
                    type:'table-list',
                    label:'Identify evidence for testing procedures that require observation of processes or examination of system evidence, such as configurations, settings, audit logs, access control lists, etc.',
                    minRows: 3,
                    columns: [
                      { id:'ref', label:'Reference Number', width:'16%' },
                      { id:'title', label:'Title of Workpaper or Evidence', width:'30%' },
                      { id:'topics', label:'Topics Covered or Evidence Collected', width:'38%' },
                      { id:'sampleSetRef', label:'Sample Set Reference Number from Table 6.3 (if applicable)', width:'16%' }
                    ]
                  }
                ]
              }
            ]
          },


          {
            number: 7,
            heading: 'Findings and Observations',
            items: [
              { id: '7.1', number: '7.1', label: 'Build and Maintain a Secure Network and Systems' },
              { id: '7.2', number: '7.2', label: 'Protect Account Data' },
              { id: '7.3', number: '7.3', label: 'Maintain a Vulnerability Management Program' },
              { id: '7.4', number: '7.4', label: 'Implement Strong Access Control Measures' },
              { id: '7.5', number: '7.5', label: 'Regularly Monitor and Test Networks' },
              { id: '7.6', number: '7.6', label: 'Maintain an Information Security Policy' },
              { id: 'APP-A', number: null, label: 'Appendix A: Additional PCI DSS Requirements' },
              { id: 'APP-B', number: null, label: 'Appendix B: Compensating Controls' },
              { id: 'APP-C', number: null, label: 'Appendix C: Compensating Controls Worksheet' },
              { id: 'APP-D', number: null, label: 'Customized Approach' },
              { id: 'APP-E', number: null, label: 'Customized Approach Template' }
            ]
          }
        ]
      }
    ]
  },
  'PCI DSS 3.2.1': {
    code: 'pci-dss-3-2-1',
    parts: [
      {
        title: 'Part I: Assessment Overview',
        sections: [
          { number: 1, heading: 'Contact Information and Report', items: [
            { id:'1.1', number:'1.1', label:'Contact Information' },
            { id:'1.2', number:'1.2', label:'Date and timeframe of' },
            { id:'1.3', number:'1.3', label:'PCI DSS version' },
            { id:'1.4', number:'1.4', label:'Additional services provided' },
            { id:'1.5', number:'1.5', label:'Summary of Findings' }
          ]},
          { number: 2, heading: 'Summary Overview', items: [
            { id:'2.1', number:'2.1', label:"Description of the entity's" },
            { id:'2.2', number:'2.2', label:'High-level network diagram' }
          ]}
        ]
      }
    ]
  }
};
