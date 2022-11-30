/* eslint-disable */
<template>
    <div>
        <!-- TAB INPUTS -->
        <input id="page-tab-manage" class="page-tab-input" name="page-tab-input" type="radio" checked />
        <input id="page-tab-create" class="page-tab-input" name="page-tab-input" type="radio" />
        <input id="page-tab-embed" class="page-tab-input" name="page-tab-input" type="radio" />
        <!--  -->
        <div class="client-leads-header page-tabs-container">
            <h1>{{ header }}</h1>
            <label class="page-tab page-tab-manage" for="page-tab-manage">Manage Your Leads</label>
            <label class="page-tab page-tab-create" for="page-tab-create">Create a New Lead</label>
            <label class="page-tab page-tab-embed" for="page-tab-embed">Embed Lead Form</label>
        </div>

        <section class="tabbed-page manage-leads table-scroll">
            <table id="leads_list" class="nowrap">
                <tr>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Pref Name</th>
                    <th>&nbsp;</th>
                    <th>DOB</th>
                    <th>City</th>
                    <th>Notes</th>
                    <th>Delete</th>
                    <th>Intake</th>
                </tr>
                <tr v-for="client_lead in client_leads_list" :key="client_lead.email">
                    <td>{{ client_lead.email.replace('@', '@ ') }}</td>
                    <td>{{ client_lead.phone }}</td>
                    <td>{{ client_lead.first_name }}</td>
                    <td>{{ client_lead.last_name }}</td>
                    <td>{{ client_lead.preferred_name }}</td>
                    <td>{{ getGenderInitial(client_lead.gender) }}</td>
                    <td>{{ client_lead.dob }}</td>
                    <td>{{ client_lead.city }}</td>
                    <td>{{ client_lead.notes }}</td>
                    <td>
                        <button @click="lead_delete(client_lead.email)" type="button" class="no-bg">
                            <span class="material-icons-outlined">close</span>
                        </button>
                    </td>
                    <td class="thin-buttons">
                        <div v-if="!client_lead.imported" class="submit-button submitButton">
                            <button @click="new_client(client_lead)" type="submit" class="secondary">
                                <span> Import </span>
                            </button>
                        </div>
                        <div v-else id="leads_btns">
                            <button @click="find_client(client_lead)" type="submit" class="primary">
                                <span>Find Client</span>
                            </button>
                            <button @click="new_client(client_lead)" type="submit" class="primary">
                                <span>Re-import</span>
                            </button>
                        </div>
                    </td>
                </tr>
            </table>
        </section>

        <section class="tabbed-page create-lead white-page-body">
            <form id="birchnotes_lead_form_id" class="" name="birchnotes_lead_form_id">
                <div class="flex fullwidth">
                    <div class="status flex-1 right-15">
                        <label for="status">Status</label>
                        <select id="status" name="status">
                            <option>Lead</option>
                            <option>Considering</option>
                            <option>Cold</option>
                            <option>Referred Out</option>
                        </select>
                    </div>
                    <div class="source flex-3">
                        <label>Source</label>
                        <input type="source" name="source" id="source" placeholder="" />
                    </div>
                </div>
                <div class="flex">
                    <div class="first-name flex-2 right-15">
                        <label>First Name</label>
                        <input type="text" name="first_name" id="first_name" placeholder="" />
                    </div>
                    <div class="last-name flex-2 right-15">
                        <label>Last Name</label>
                        <input type="text" name="last_name" id="last_name" placeholder="" />
                    </div>
                    <div class="pref-name flex-2 right-15">
                        <label>Preferred Name</label>
                        <input type="text" name="preferred_name" id="preferred_name" placeholder="" />
                    </div>
                    <div class="dob flex-1">
                        <label>D.O.B.</label>
                        <input type="date" name="dob" id="dob" placeholder="date of birth mm/dd/yyyy" />
                    </div>
                </div>
                <div class="flex">
                    <div class="gender flex-1 right-15">
                        <label for="gender">Gender</label>
                        <select id="gender" name="gender">
                            <option>Male</option>
                            <option>Female</option>
                        </select>
                    </div>
                    <div class="phone flex-1 right-15">
                        <label>Phone</label>
                        <input type="tel" name="phone" id="phone" placeholder="" />
                    </div>
                    <div class="email flex-1">
                        <label>Email</label>
                        <input type="email" name="email" id="email" placeholder="" />
                    </div>
                </div>
                <div class="flex">
                    <div class="address flex-4 right-15">
                        <label>Address</label>
                        <input type="text" name="address1" id="address1" placeholder="" />
                    </div>
                    <div class="city flex-2 right-15">
                        <label>City</label>
                        <input type="text" name="city" id="city" placeholder="" />
                    </div>
                    <div class="state flex-1 right-15">
                        <Dropdown
                            label="State"
                            name="State"
                            id="state"
                            :options="stateInitials"
                            class="field-container fullwidth"
                            v-model="new_client_state"
                        />
                    </div>
                    <div class="zip flex-1">
                        <label>Zip</label>
                        <input type="text" name="zip" id="zip" placeholder="Zip code" />
                    </div>
                </div>
                <div>
                    <div class="notes">
                        <input type="hidden" name="company_id" id="company_id" :value="company_id_hash" />
                        <label>Notes</label>
                        <textarea name="notes" id="notes" placeholder=""></textarea>
                    </div>
                </div>
                <div class="submit-button submitButton align-right top-30">
                    <button class="secondary">Cancel</button>

                    <button @click.prevent="go" type="submit" class="">Create</button>
                </div>
            </form>
        </section>

        <section class="tabbed-page embed-lead white-page-body">
            <div>
                <p>
                    <b>Embed a Lead Form to Your Business Website</b>
                    <br />
                    Select the fields you would like to include on your website form. Then, choose to either copy the
                    code for yourself, or have it emailed to someone else to embed.
                </p>
                <!-- <p>Use this code snippet to add a leads capture form to your website : <br> ( "company_id" = {{ company_id_hash }} )</p> -->
                <p class="select-fields-header"><b>Select Fields</b></p>
                <div class="fields-container">
                    <label class="flex center" for="FirstName"
                        ><input
                            type="checkbox"
                            id="FirstName"
                            name="FirstName"
                            value="firstName"
                            v-model="selectedInputs"
                        />First Name</label
                    >
                    <label class="flex center" for="LastName"
                        ><input
                            type="checkbox"
                            id="LastName"
                            name="LastName"
                            value="lastName"
                            v-model="selectedInputs"
                        />Last Name</label
                    >
                    <label class="flex center" for="PreferredName"
                        ><input
                            type="checkbox"
                            id="PreferredName"
                            name="PreferredName"
                            value="preferredName"
                            v-model="selectedInputs"
                        />Preferred Name</label
                    >
                    <label class="flex center" for="Gender"
                        ><input
                            type="checkbox"
                            id="Gender"
                            name="Gender"
                            value="gender"
                            v-model="selectedInputs"
                        />Gender</label
                    >
                    <label class="flex center" for="DOB"
                        ><input type="checkbox" id="DOB" name="DOB" value="dob" v-model="selectedInputs" />DOB</label
                    >
                    <label class="flex center" for="Phone"
                        ><input
                            type="checkbox"
                            id="Phone"
                            name="Phone"
                            value="phone"
                            v-model="selectedInputs"
                        />Phone</label
                    >
                    <label class="flex center" for="Email"
                        ><input
                            type="checkbox"
                            id="Email"
                            name="Email"
                            value="email"
                            v-model="selectedInputs"
                            disabled
                        />Email</label
                    >
                    <label class="flex center" for="Address"
                        ><input
                            type="checkbox"
                            id="Address"
                            name="Address"
                            value="address"
                            v-model="selectedInputs"
                        />Street Address</label
                    >
                    <label class="flex center" for="City"
                        ><input
                            type="checkbox"
                            id="City"
                            name="City"
                            value="city"
                            v-model="selectedInputs"
                        />City</label
                    >
                    <label class="flex center" for="State"
                        ><input
                            type="checkbox"
                            id="State"
                            name="State"
                            value="state"
                            v-model="selectedInputs"
                        />State</label
                    >
                    <label class="flex center" for="Zip"
                        ><input type="checkbox" id="Zip" name="Zip" value="zip" v-model="selectedInputs" />Zip</label
                    >
                    <label class="flex center" for="Notes"
                        ><input
                            type="checkbox"
                            id="Notes"
                            name="Notes"
                            value="notes"
                            v-model="selectedInputs"
                        />Notes</label
                    >
                </div>
                <hr />
                <div class="copy-code bottom-30">
                    <p><b>Copy Code</b></p>
                    <p>
                        <a @click="copy2clip" type="submit" class="primary inline-block align-center">Click here</a> &nbsp;to copy the code for the
                        selected fields if you would like to embed yourself.
                    </p>
                    <textarea id="codesource" style="display: none" v-html="html"> </textarea>
                    <!-- <div class="submit-button submitButton">
                        <button @click="copy2clip" type="submit" class="primary">Copy Code</button>
                    </div> -->
                </div>
                <hr>
                <div class="email-code">
                    <p><b>Email Code</b></p>
                    <div class="flex bottom">
                        <div class="flex-1 right-15">
                            <label>Email</label>
                            <input
                                type="email"
                                name="webmaster_email"
                                id="webmaster_email"
                                placeholder="Webmaster Email Address"
                            />
                        </div>
                        <button @click="send_code2email" type="submit" class="primary">
                            <span> Email Code </span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
<script>
    const api_root = 'client_leads';

    const hashCode = (s) =>
        s
            .toString()
            .split('')
            .reduce((a, b) => {
                a = (a << 5) - a + b.charCodeAt(0);
                return Math.abs(a & a);
            }, 0);

    // const clipboardy = require('clipboardy')

    const elements = {
        firstName: `<td>
                        <label for="first_name">First Name</label>
                        <input type="text" name="first_name" id="first_name" placeholder="First Name">
                    </td>`,
        lastName: `<td>
                    <label for="last_name">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      placeholder="Last Name"
                    />
                  </td>`,
        preferredName: `<td>
                            <label for="preferred_name">Preferred</label>
                            <input
                              type="text"
                              name="preferred_name"
                              id="preferred_name"
                              placeholder="Preferred Name"
                            />
                          </td>`,
        email: `<td>
                <label for="email">Email</label>
                <input type="email" name="email" id="email" placeholder="Email" />
              </td>`,
        phone: `<td>
                <label for="phone">Phone</label>
                <input type="tel" name="phone" id="phone" placeholder="Phone" />
              </td>`,
        address: `<td>
                    <label for="address1">Address</label>
                    <input
                      type="text"
                      name="address1"
                      id="address1"
                      placeholder="Address"
                    />
                  </td>`,
        gender: `<td>
                    <label for="gender">Gender</label>
                    <select id="gender" name="gender">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </td>`,
        dob: `<td>
                <label for="dob">D.O.B.</label>
                <input
                  type="date"
                  name="dob"
                  id="dob"
                  placeholder="date of birth mm/dd/yyyy"
                />
              </td>`,
        city: `<td>
                <label for="city">City</label>
                <input type="text" name="city" id="city" placeholder="City" />
              </td>`,
        state: `<td>
                <label for="state">State</label>
                <input type="text" name="state" id="state" placeholder="State" />
              </td>`,
        zip: `<td>
                <label for="zip">Zip</label>
                <input type="text" name="zip" id="zip" placeholder="Zip code" />
              </td>`,
        notes: `<td colspan="2">
                <textarea name="notes" id="notes" placeholder="Notes"></textarea>
              </td>`
    };
    const sortValues = {
        firstName: 1,
        lastName: 2,
        preferredName: 3,
        gender: 4,
        dob: 5,
        phone: 6,
        email: 7,
        address: 8,
        city: 9,
        state: 10,
        zip: 11,
        notes: 12
    };

    export default {
        name: 'ClientLeads',
        data() {
            return {
                selectedClientId: '',
                showAllClients: 1,
                client_leads_list: [],
                selectedInputs: ['email'],
                company_id_hash: 'hashcode',
                ran_list: 1,
                stateInitials: [
                    'AL',
                    'AK',
                    'AZ',
                    'AR',
                    'CA',
                    'CO',
                    'CT',
                    'DE',
                    'DC',
                    'FL',
                    'GA',
                    'HI',
                    'ID',
                    'IL',
                    'IN',
                    'IA',
                    'KS',
                    'KY',
                    'LA',
                    'ME',
                    'MD',
                    'MA',
                    'MI',
                    'MN',
                    'MS',
                    'MO',
                    'MT',
                    'NE',
                    'NV',
                    'NH',
                    'NJ',
                    'NM',
                    'NY',
                    'NC',
                    'ND',
                    'OH',
                    'OK',
                    'OR',
                    'PA',
                    'RI',
                    'SC',
                    'SD',
                    'TN',
                    'TX',
                    'UT',
                    'VT',
                    'VA',
                    'WA',
                    'WV',
                    'WI',
                    'WY'
                ],
                new_client_state: 'FL'
            };
        },
        computed: {
            header() {
                return this.headerText || this.pageMeta.title;
            },
            showDelete() {
                return 1;
            },
            html() {
                let rows = '';
                let lastAdded = '';
                let inputs = [...this.selectedInputs].sort((a, b) => sortValues[a] - sortValues[b]);

                for (let i = 0; i < inputs.length; i++) {
                    const currentHtml = elements[inputs[i]];

                    if (inputs[i] === 'notes') {
                        if (lastAdded && !lastAdded.endsWith('</tr>')) {
                            rows += '</tr>';
                        }

                        rows += '<tr>';
                        rows += currentHtml;
                        rows += '</tr>';
                        lastAdded = '</tr>';

                        continue;
                    }

                    if (i === inputs.length - 1) {
                        if (lastAdded.endsWith('</tr>') || !lastAdded) {
                            rows += '<tr>';
                        }

                        rows += currentHtml;
                        rows += '</tr>';

                        break;
                    }

                    if (i % 2 === 0 || i === 0) {
                        rows += '<tr>';
                        rows += currentHtml;
                        lastAdded = currentHtml;
                        continue;
                    }

                    if ((i + 1) % 2 === 0) {
                        rows += currentHtml;
                        rows += '</tr>';
                        lastAdded = '</tr>';
                    }
                }

                return `
                    <script src="https://d2efvzpf0git3s.cloudfront.net/curl.min.js"><\/script>
                    <form id="birchnotes_lead_form_id" name="birchnotes_lead_form_id">
                        <table border='0'>
                            ${rows}
                            <tr>
                                <td colspan="2">
                                    <input type="hidden" name="company_id" id="company_id" value="${this.company_id_hash}">
                                </td>
                        </tr>
                        </table>
                        <button type='submit'>Submit</button>
                    </form>
                    <style>
                      @import url("https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300;1,400;1,600;1,700;1,800&display=swap");
                      #birchnotes_lead_form_id {
                        max-width: 600px;
                        padding: 20px;
                        box-shadow: 0 0 10px gray;
                      }
                      #birchnotes_lead_form_id * {
                        font: normal 16px/1.5 "Open Sans", sans-serif;
                        color: #777;
                        transition: 0.2s ease;
                      }
                      #birchnotes_lead_form_id table {
                        width: 100%;
                      }
                      #birchnotes_lead_form_id td {
                        width: 50%;
                        padding: 5px;
                      }
                      #birchnotes_lead_form_id input,
                      #birchnotes_lead_form_id select,
                      #birchnotes_lead_form_id textarea {
                        margin: 0;
                        padding: 10px 15px;
                        width: 100%;
                        outline: none;
                        border: none;
                        box-shadow: inset 0 0 0 1px #777;
                        border-radius: 5px;
                      }
                      #birchnotes_lead_form_id textarea {
                        min-height: 88px;
                      }
                      #birchnotes_lead_form_id input:focus,
                      #birchnotes_lead_form_id select:focus {
                        box-shadow: inset 0 0 0 2px #5c73f2;
                        color: black;
                      }
                      #birchnotes_lead_form_id label {
                        font-size: 14px;
                        display: none;
                      }
                      #birchnotes_lead_form_id button {
                        background: #5c73f2;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        padding: 10px 30px;
                      }
                      #birchnotes_lead_form_id button:hover {
                        background: #2d4aee;
                        color: white;
                        cursor: pointer;
                      }
                      #birchnotes_lead_form_id .align-right {
                        text-align: right;
                      }
                      @media (max-width: 700px) {
                        #birchnotes_lead_form_id td {
                          display: block;
                          width: 100%;
                        }
                      }
                    </style>
                `;
            }
        },
        methods: {
            async get_client_leads_list() {
                if (!this.ran_list) {
                    const res = await this.$api.get(`/${api_root}`);
                    this.client_leads_list = res.data.rows;
                    this.client_leads_list.forEach((v, k) => {
                        this.client_leads_list[k].user_href = '/user/edit/' + v.imported;
                        this.client_leads_list[k].find_href = '/client?search=' + v.first_name + '%20' + v.last_name;
                        this.client_leads_list[k].user_name = v.user_name;
                    });
                    this.ran_list = 1;
                }
            },
            valid_email(v) {
                if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v)) {
                    return true;
                }
                alert('Please enter a valid email');
                return false;
            },
            async go() {
                const url = 'https://tjuj2vfg3f.execute-api.us-east-1.amazonaws.com/stag';
                const apikey = 'R1cYfmYtQO8MYnQWMOMVbaBFRiB4Djpj9Nlgqi9z';
                let birchnotes_lead_form_id = document.querySelector('#birchnotes_lead_form_id');
                const object = {};
                const fields = Array.from(birchnotes_lead_form_id.elements);
                fields.forEach((v) => {
                    if (v.id) {
                        object[v.id] = v.value;
                    }
                });
                if (this.valid_email(object.email)) {
                    const self = this;

                    const json = JSON.stringify(object);
                    const headers = {
                        'Content-type': 'application/json; charset=UTF-8',
                        'x-api-key': apikey
                    };
                    await fetch(url, { method: 'POST', body: json, headers: headers }).then(function() {
                        fields.forEach((v) => {
                            if (v.id) {
                                v.value = '';
                            }
                        });

                        self.$toasted.success('Lead created successfully');
                        // birchnotes_lead_form_id.innerHTML = '<div class="thankyou">Thank you</div>'
                    });
                    this.ran_list = 0;
                    this.get_client_leads_list();
                }
            },
            copy2clip() {
                navigator.clipboard
                    .writeText(this.html)
                    .then(() => {
                        this.$toasted.success('Copied code to your clipboard');
                    })
                    .catch((err) => console.log(err));
            },
            send_code2email() {
                // let code_source = document.querySelector('#codesource')
                // let objJsonB64 = encodeURIComponent(Buffer.from(code_source.value).toString("base64"))
                // let email_to = document.querySelector('#webmaster_email').value
                // await this.$router.push({ name: 'ReferralDetail', params: { id: res.data.id } })
                // router.push({ path: 'email/send?to=' + email_to + '&subject=Leads_Form_Code&body=' + objJsonB64 })
            },
            async lead_delete(email) {
                let affirmation = confirm('Delete Lead Info?');
                if (affirmation) {
                    await this.$api.delete(`/${api_root}/${email}`);
                    this.ran_list = 0;
                }
            },
            async lead_imported(email) {
                let user_id = this.$store.state.user.id;
                let user_name = this.$store.state.user.name;
                await this.$api.post(`/${api_root}/imported/${email}`, {
                    email: email,
                    user_id: user_id,
                    user_name: user_name
                });
            },
            async new_client(client_lead) {
                let payload = {
                    new_hit: 1,
                    status: 'active',
                    firstName: client_lead.first_name,
                    lastName: client_lead.last_name,
                    phone: client_lead.phone,
                    email: client_lead.email,
                    streetAddress: client_lead.address1,
                    city: client_lead.city,
                    state: client_lead.state,
                    dob: client_lead.dob,
                    gender: client_lead.gender,
                    zip: client_lead.zip
                };

                const store = this.$store;
                setTimeout(function() {
                    store.commit('newResourceModal/openNewClientModal2', payload);
                }, 0);

                await this.lead_imported(client_lead.email);
            },
            async find_client(client_lead) {
                let params = {
                    overrideFilter: {
                        sort: {},
                        search: { like_all: client_lead.email },
                        filter: {},
                        page: { num_per_page: '10', current_page: 1 },
                        column: []
                    }
                };
                await this.$router.push({ name: 'Clients', params });
            },
            getGenderInitial(gender) {
                return gender ? gender.substring(0, 1) : '-';
            }
        },
        mounted() {
            this.ran_list = 0;
            var sub = /:\/\/([^\/]+)/.exec(window.location.href)[1].split('.')[0];
            this.company_id_hash = hashCode(sub + this.$store.state.user.company_id);
        },
        watch: {
            ran_list: function() {
                this.get_client_leads_list();
            }
        }
    };
</script>
