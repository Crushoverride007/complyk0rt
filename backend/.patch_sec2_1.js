const fs = require('fs');
const p = 'src/frameworks/index.ts';
let s = fs.readFileSync(p, 'utf8');
const before = "{ id: '2.1', number: '2.1', label: 'Business description' },";
const after = `{
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
              },`;
if (!s.includes(before)) {
  console.error('Pattern not found');
  process.exit(2);
}
s = s.replace(before, after);
fs.writeFileSync(p, s);
console.log('Updated Section 2.1');
