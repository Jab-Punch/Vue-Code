<template>
    <div class="modal__backdrop" :class="{ modal__closed: !open, modal__open: open }" @click.self="handleCancel">
        <div class="modal__content">
            <div @click.self="handleCancel" class="material-icons-outlined clear close-x">clear</div>
            <div class="flex">
                <div class="right-20">
                    <span class="material-icons-outlined orange large-icon">help_outline</span>
                </div>
                <div>
                    <h2 class="bottom-5">Send Email to Client?</h2>
                    <p>
                        Are you sure you want to send an email to remind this client to pay their
                        account balance for {{ theAmountOwed }}?
                    </p>
                </div>
            </div>
            <div class="align-right top-20">
                <button class="secondary cancel bottom-0" type="button" @click="handleCancel">
                    Cancel
                </button>
                <button
                    class="primary bottom-0"
                    type="button"
                    @click="sendEmail"
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import api from '@/util/api';
    import { settings } from '@/util/apiRequests';

    export default {
        name: 'AccountBalanceEmailModal',
        props: {
            open: Boolean,
            modal_client: {
                type: [String, Number],
                required: false,
                default: null
            },
            amount_owed: {
                type: [String, Number],
                required: false,
                default: null
            },
        },
        data() {
            return {
                email: {
                    from: 'noreply@birchnotes.net',
                    toAddresses: [],
                    ccAddresses: [],
                    bccAddresses: [],
                    subject: undefined,
                    html: undefined,
                    text: undefined
                },
                efield: {},
                emailContent: {},
            };
        },
        computed: {
            ...mapState({
                user: 'user'
            }),
            theAmountOwed() {
                if (this.amount_owed) {
                    return this.$getCurrency(this.amount_owed);
                } else {
                    return '$0.00';
                }
            }
        },
        methods: {
            async init() {
                await this.get_client(this.modal_client);
                await this.get_company();
                await this.load_email_templates();
            },
            async get_company() {
                const res = await this.$api.get(`/company`);
                this.efield.company = res.data.info[0];
            },
            async get_client(id) {
                if (id !== null) {
                    const res = await this.$api.get(`/clients/${id}/general-info`);
                    if (res.data) {
                        this.efield.client = res.data[0];
                    }
                }
            },
            async sendEmail() {
                const formData = this.getFormData();

                if (formData.get('to').length === 0) {
                    this.errors.to.push('To is required');
                    return;
                }

                const res = await api.post('/email/send-email', formData, {
                    params: {
                        onlySingleClient: this.modal_client ? true : false,
                        undefined
                    }
                });
                if (res.status === 200) {
                    this.$toasted.success('Message sent.');
                } else {
                    this.$toasted.error('Failed to send message.');
                }
                this.$emit('closeModal');
            },
            getFormData() {
                const formData = new FormData();

                this.email.toAddresses.splice(0, this.email.toAddresses.length);
                this.email.toAddresses.push(this.efield.client);

                let email = this.getMessage();
                for (let field in email) {
                    formData.append(field, email[field]);
                }

                return formData;
            },
            getMessage() {
                return {
                    to: this.getAddresses(this.email.toAddresses),
                    cc: this.getAddresses(this.email.ccAddresses),
                    bcc: this.getAddresses(this.email.bccAddresses),
                    subject: this.email.subject,
                    html: this.email.html,
                    text: this.email.text
                };
            },
            getAddresses(arr) {
                let addresses = [];
                for (let el of arr) {
                    addresses.push(el.email);
                }
                return addresses;
            },
            async load_email_templates() {

                const sett = await this.load_settings();
                const email_template_id = sett.find((val) => val.setting == "send_account_balance_reminder").value;

                const res = await this.$api.get(`/email_templates/${email_template_id}`);
                this.emailContent = res.data.info[0];

                this.email.subject = this.emailContent.email_template_title;

                this.refreshHTML();

            },
            refreshHTML() {
                let template_html = "";
                if (this.emailContent && this.emailContent.html && this.efield.client) {
                    this.efield.client.AmountOwed = this.$getCurrency(this.amount_owed);
                    template_html = this.emailContent.html.toString();
                    let regex = /{efield[a-z_.]*}/gim;
                    let key, str, keys, i, newval, match;
                    const matches = [...template_html.matchAll(regex)];
                    for (match of matches) {
                        str = match[0];
                        key = str.slice(8, -1);
                        keys = key.split('.');
                        newval = {};
                        newval = Object.assign(newval, this.efield);
                        for (i in keys) {
                            if (newval[keys[i]]) {
                                newval = newval[keys[i]];
                            } else {
                                newval = str;
                                break;
                            }
                        }
                        newval = newval.toString();
                        template_html = template_html.replace(str, newval);
                    }
                }

                this.email.html = template_html;
            },
            async load_settings() {
                try {
                    const res = await api.get(settings.getList('company', this.user.company_id));
                    return res.data;
                } catch (error) {
                    //
                    console.log("Error:",error);
                    return null;
                }
            },
            handleCancel() {
                this.$emit('closeModal');
            },
        },
        async created() {
            await this.init();
        },
        watch: {
            amount_owed: {
                immediate: true,
                deep: true,
                handler: function(newVal, oldVal) {
                    if(newVal !== oldVal){
                        this.amount_owed = newVal;
                        this.refreshHTML();
                    }
                }
            },
        }
    };
</script>