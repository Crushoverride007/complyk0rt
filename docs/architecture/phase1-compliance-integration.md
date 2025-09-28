# ComplykOrt Phase 1 - Compliance Module Integration

## Overview
Phase 1 extends the Phase 0 foundation with compliance-specific entities and workflows. This design maintains backward compatibility while adding specialized functionality for regulatory frameworks, evidence management, and automated reporting.

## Key Design Principles
1. **Extend, Don't Replace**: Phase 0 entities remain unchanged, Phase 1 adds specializations
2. **Framework Agnostic**: Support multiple compliance frameworks (SOC 2, ISO 27001, PCI DSS, etc.)
3. **Evidence-Centric**: Transform generic files into structured evidence with validation
4. **Automated Workflows**: Reduce manual effort through intelligent automation
5. **Integration Points**: Clear boundaries for document parsing and report generation services

## Phase 1 Data Models

### Framework
**Compliance framework definition (SOC 2, ISO 27001, etc.)**

```sql
frameworks {
  id: UUID PRIMARY KEY
  name: VARCHAR(255) NOT NULL              -- "SOC 2 Type II"
  version: VARCHAR(50) NOT NULL            -- "2017"
  framework_type: VARCHAR(100) NOT NULL    -- "soc2", "iso27001", "pci_dss"
  description: TEXT
  status: VARCHAR(20) DEFAULT 'active'     -- active, deprecated, draft
  metadata: JSONB DEFAULT '{}'             -- framework-specific configuration
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  UNIQUE(framework_type, version)
}
```

### Section
**Compliance framework sections/controls**

```sql
sections {
  id: UUID PRIMARY KEY
  framework_id: UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE
  section_key: VARCHAR(100) NOT NULL       -- "CC1.1", "A.5.1.1", "3.1"
  title: VARCHAR(500) NOT NULL             -- "Control Environment"
  description: TEXT
  parent_section_key: VARCHAR(100) NULL    -- for hierarchical sections
  input_schema: JSONB DEFAULT '{}'         -- JSON schema for section-specific data
  evidence_requirements: JSONB DEFAULT '[]' -- required evidence types
  docx_bindings: JSONB DEFAULT '[]'        -- template variable mappings
  weight: INTEGER DEFAULT 1               -- scoring weight
  display_order: INTEGER DEFAULT 0
  status: VARCHAR(20) DEFAULT 'active'     -- active, deprecated
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  UNIQUE(framework_id, section_key)
  INDEX(framework_id, parent_section_key)
}
```

### Assessment
**Specialization of Project for compliance assessments**

```sql
assessments {
  id: UUID PRIMARY KEY
  project_id: UUID UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE
  framework_id: UUID NOT NULL REFERENCES frameworks(id) ON DELETE RESTRICT
  scope_profile: JSONB DEFAULT '{}'        -- assessment-specific configuration
  control_mapping: JSONB DEFAULT '{}'      -- custom control mappings
  testing_approach: TEXT                   -- assessment methodology
  assessment_period_start: DATE
  assessment_period_end: DATE
  compliance_score: DECIMAL(5,2) NULL      -- calculated compliance percentage
  risk_rating: VARCHAR(20) NULL            -- low, medium, high, critical
  certification_target: DATE NULL          -- target certification date
  auditor_notes: TEXT
  status: VARCHAR(20) DEFAULT 'planning'   -- planning, fieldwork, reporting, complete
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  INDEX(framework_id, status)
  INDEX(project_id)
}
```

### Evidence
**Structured evidence linking files to compliance sections**

```sql
evidence {
  id: UUID PRIMARY KEY
  project_id: UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
  section_key: VARCHAR(100) NOT NULL       -- maps to sections.section_key
  file_id: UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE
  evidence_type: VARCHAR(100) NOT NULL     -- "policy", "procedure", "screenshot", "log"
  title: VARCHAR(255) NOT NULL             -- human-readable evidence title
  description: TEXT
  collected_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  valid_from: DATE NULL                    -- evidence validity period
  valid_until: DATE NULL
  validation_status: VARCHAR(20) DEFAULT 'pending' -- pending, validated, rejected, expired
  validation_notes: TEXT
  validated_by: UUID NULL REFERENCES users(id) ON DELETE SET NULL
  validated_at: TIMESTAMP WITH TIME ZONE NULL
  metadata: JSONB DEFAULT '{}'             -- evidence-specific attributes
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  INDEX(project_id, section_key)
  INDEX(file_id)
  INDEX(evidence_type, validation_status)
  UNIQUE(project_id, section_key, file_id) -- prevent duplicate evidence
}
```

### ReportTemplate
**Compliance report templates for different frameworks**

```sql
report_templates {
  id: UUID PRIMARY KEY
  framework_id: UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE
  name: VARCHAR(255) NOT NULL              -- "SOC 2 Type II Report"
  template_type: VARCHAR(50) NOT NULL      -- "docx", "pdf", "html"
  version: VARCHAR(50) NOT NULL            -- "1.0", "2024.1"
  file_url: VARCHAR(500) NOT NULL          -- S3 path to template file
  variable_schema: JSONB DEFAULT '{}'      -- available template variables
  sections_mapping: JSONB DEFAULT '{}'     -- section-to-template mappings
  status: VARCHAR(20) DEFAULT 'active'     -- active, deprecated, draft
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  INDEX(framework_id, template_type)
}
```

### ExportJob
**Compliance report generation tracking**

```sql
export_jobs {
  id: UUID PRIMARY KEY
  project_id: UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
  template_id: UUID NOT NULL REFERENCES report_templates(id) ON DELETE RESTRICT
  requested_by: UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
  job_type: VARCHAR(50) NOT NULL           -- "report", "evidence_package", "audit_log"
  parameters: JSONB DEFAULT '{}'           -- job-specific parameters
  status: VARCHAR(20) DEFAULT 'queued'     -- queued, processing, completed, failed
  progress: INTEGER DEFAULT 0              -- completion percentage (0-100)
  outputs: JSONB DEFAULT '[]'              -- generated file URLs
  error_message: TEXT NULL
  started_at: TIMESTAMP WITH TIME ZONE NULL
  completed_at: TIMESTAMP WITH TIME ZONE NULL
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  INDEX(project_id, status)
  INDEX(requested_by, created_at)
}
```

### ComplianceResponse
**Section-specific compliance responses and status**

```sql
compliance_responses {
  id: UUID PRIMARY KEY
  project_id: UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
  section_key: VARCHAR(100) NOT NULL       -- maps to sections.section_key
  implementation_status: VARCHAR(20) DEFAULT 'not_started' -- not_started, in_progress, implemented, not_applicable
  response_text: TEXT                      -- detailed compliance response
  control_description: TEXT               -- how the control is implemented
  testing_procedures: TEXT                -- testing performed
  testing_results: TEXT                   -- results of testing
  exceptions: TEXT                        -- identified exceptions/gaps
  remediation_plan: TEXT                  -- plan to address gaps
  responsible_party: UUID NULL REFERENCES users(id) ON DELETE SET NULL
  target_completion: DATE NULL
  last_review_date: DATE NULL
  next_review_date: DATE NULL
  reviewer: UUID NULL REFERENCES users(id) ON DELETE SET NULL
  custom_fields: JSONB DEFAULT '{}'        -- framework-specific fields
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  UNIQUE(project_id, section_key)
  INDEX(project_id, implementation_status)
  INDEX(responsible_party)
}
```

## Integration with Phase 0 Entities

### Extended Project Capabilities
When a project becomes an assessment, it gains:
- Framework assignment via `assessments.framework_id`
- Section-based task organization using `tasks.section_key`
- Evidence collection through `evidence` table
- Compliance scoring and reporting capabilities

### Enhanced Task Management
Tasks in compliance projects include:
- Section mapping via `section_key` for framework organization
- Evidence collection requirements
- Control implementation tracking
- Automated task generation from framework sections

### Structured File Management
Files become evidence when:
- Linked to specific compliance sections
- Categorized by evidence type
- Subject to validation workflows
- Tracked with validity periods

## Migration Strategy: Phase 0 → Phase 1

### Database Migration Steps

1. **Create Phase 1 Tables**
   ```sql
   -- Add new tables without affecting existing data
   CREATE TABLE frameworks (...);
   CREATE TABLE sections (...);
   CREATE TABLE assessments (...);
   CREATE TABLE evidence (...);
   CREATE TABLE report_templates (...);
   CREATE TABLE export_jobs (...);
   CREATE TABLE compliance_responses (...);
   ```

2. **Seed Framework Data**
   ```sql
   -- Insert common frameworks
   INSERT INTO frameworks (name, version, framework_type, description) VALUES
   ('SOC 2 Type II', '2017', 'soc2', 'Security, Availability, and Confidentiality'),
   ('ISO 27001', '2022', 'iso27001', 'Information Security Management System'),
   ('PCI DSS', '4.0', 'pci_dss', 'Payment Card Industry Data Security Standard');
   
   -- Insert framework sections (hundreds of records per framework)
   INSERT INTO sections (framework_id, section_key, title, description, ...) VALUES ...;
   ```

3. **Convert Existing Projects (Optional)**
   ```sql
   -- Users can optionally convert existing projects to assessments
   -- This is done through the UI, not automatic migration
   ```

4. **Enable Phase 1 Features**
   ```sql
   -- Update application configuration
   UPDATE application_settings SET phase1_enabled = true;
   ```

### API Migration Strategy
- Phase 0 endpoints remain unchanged
- New Phase 1 endpoints added with `/v1/compliance/` prefix
- Existing project endpoints extended with optional compliance fields
- Backward compatibility maintained for all Phase 0 operations

### UI Migration Strategy
- Phase 0 UI remains fully functional
- New compliance features appear as optional project enhancements
- Framework selection available in project creation
- Section-based task organization appears when framework assigned

## Integration Points for External Services

### Parsing Service Integration (Docling)
ComplykOrt will integrate with document parsing services to extract structured content from compliance documents.

**Integration Point**: `/api/v1/compliance/ingestion`
```json
{
  "endpoint": "/api/v1/compliance/ingestion/webhook",
  "method": "POST",
  "payload": {
    "document_id": "uuid",
    "framework_type": "soc2",
    "parsed_sections": [
      {
        "section_key": "CC1.1",
        "content": "extracted text content",
        "metadata": {
          "confidence": 0.95,
          "page_numbers": [1, 2, 3]
        }
      }
    ],
    "status": "completed"
  }
}
```

**Use Cases**:
- Parse compliance framework documents to auto-populate sections
- Extract evidence from policy documents
- Analyze existing documentation for compliance gaps
- Pre-fill compliance responses with extracted content

### Report Generation Integration (docxtpl)
ComplykOrt will integrate with document generation services to create compliance reports.

**Integration Point**: `/api/v1/compliance/reports/generate`
```json
{
  "endpoint": "/api/v1/compliance/reports/generate", 
  "method": "POST",
  "payload": {
    "project_id": "uuid",
    "template_id": "uuid",
    "format": "docx",
    "data": {
      "assessment_period": "2024-01-01 to 2024-03-31",
      "organization": {
        "name": "Acme Corporation",
        "address": "123 Main St, City, State"
      },
      "sections": [
        {
          "section_key": "CC1.1",
          "response": "Control environment response text...",
          "evidence": ["file1.pdf", "file2.xlsx"],
          "status": "implemented"
        }
      ]
    }
  }
}
```

**Use Cases**:
- Generate SOC 2 readiness reports
- Create ISO 27001 documentation packages
- Produce audit evidence compilations
- Export compliance status summaries

## Phase 1 API Extensions

### Framework Management
```http
GET    /api/v1/compliance/frameworks                 # List available frameworks
GET    /api/v1/compliance/frameworks/:id             # Get framework details
GET    /api/v1/compliance/frameworks/:id/sections    # List framework sections
```

### Assessment Management
```http
POST   /api/v1/projects/:id/convert-to-assessment    # Convert project to assessment
GET    /api/v1/assessments/:id                       # Get assessment details
PUT    /api/v1/assessments/:id                       # Update assessment
GET    /api/v1/assessments/:id/compliance-score      # Get current compliance score
POST   /api/v1/assessments/:id/calculate-score       # Recalculate compliance score
```

### Evidence Management
```http
GET    /api/v1/projects/:id/evidence                 # List project evidence
POST   /api/v1/evidence                              # Create evidence record
PUT    /api/v1/evidence/:id                          # Update evidence
DELETE /api/v1/evidence/:id                          # Delete evidence
POST   /api/v1/evidence/:id/validate                 # Validate evidence
GET    /api/v1/evidence/by-section/:sectionKey       # Evidence by section
```

### Compliance Responses
```http
GET    /api/v1/projects/:id/responses                # List compliance responses
POST   /api/v1/responses                             # Create/update response
GET    /api/v1/responses/:id                         # Get response details
PUT    /api/v1/responses/:id                         # Update response
```

### Report Generation
```http
GET    /api/v1/compliance/templates                  # List report templates
POST   /api/v1/projects/:id/reports/generate         # Generate report
GET    /api/v1/export-jobs/:id                       # Check generation status
GET    /api/v1/export-jobs/:id/download              # Download generated report
```

## RBAC Extensions for Phase 1

### New Role: Compliance Officer
- All Manager permissions plus:
- Framework management
- Evidence validation
- Report generation
- Compliance scoring oversight

### Extended Permissions Matrix

| Resource | Action | Admin | Manager | Compliance Officer | Contributor | Viewer |
|----------|--------|-------|---------|-------------------|-------------|--------|
| **Frameworks** | | | | | | |
| View frameworks | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage frameworks | ✓ | ✗ | ✓ | ✗ | ✗ |
| **Evidence** | | | | | | |
| View evidence | ✓ | ✓ | ✓ | ✓* | ✓* |
| Upload evidence | ✓ | ✓ | ✓ | ✓* | ✗ |
| Validate evidence | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Reports** | | | | | | |
| Generate reports | ✓ | ✓ | ✓ | ✗ | ✗ |
| View reports | ✓ | ✓ | ✓ | ✓* | ✓* |

\* Subject to project-level permissions

## Performance Considerations

### Compliance Scoring
- Async calculation for large frameworks
- Cached scores with TTL
- Incremental updates on evidence changes
- Background recalculation jobs

### Evidence Management
- File deduplication by hash
- Lazy loading of evidence metadata
- Paginated evidence lists
- Search indexing on evidence content

### Report Generation
- Queued job processing
- Template caching
- Incremental report updates
- Large report handling (>100MB)

## Phase 1 Success Metrics

### MVP Acceptance Criteria
1. ✅ Convert existing project to SOC 2 assessment
2. ✅ Upload and categorize evidence by section
3. ✅ Generate basic compliance report
4. ✅ Track compliance score across sections
5. ✅ Evidence validation workflow
6. ✅ Framework section navigation

### Key Performance Indicators
- Time to complete assessment setup: <30 minutes
- Evidence upload success rate: >95%
- Report generation time: <5 minutes for standard reports
- Compliance score calculation: <10 seconds for 100+ sections
- User adoption of compliance features: >60% of active projects

This Phase 1 design provides a robust foundation for compliance management while maintaining the simplicity and effectiveness of the Phase 0 project management core.
