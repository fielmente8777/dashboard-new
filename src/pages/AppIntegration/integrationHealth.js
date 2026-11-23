// Health checks for the apps whose own API tells us how they are doing.
// Each check: { id, label, status: "ok" | "warn" | "error" | "info", detail }.
// The Integrations list shows the worst one on the card; the app's page
// shows them all, so it is clear where a connection is lagging.

const RANK = { ok: 0, info: 0, warn: 1, error: 2 };

export const worstStatus = (checks = []) =>
  checks.reduce((worst, check) => (RANK[check.status] > RANK[worst] ? check.status : worst), "ok");

// the check to put on the card: the worst problem, if there is one
export const headlineCheck = (checks = []) => {
  const worst = worstStatus(checks);
  return worst === "ok" ? null : checks.find((check) => check.status === worst);
};

export const formatMoney = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export const exotelChecks = (overview) => {
  if (!overview?.connected) return [];
  const { balance, balanceError, config } = overview;
  const checks = [];

  if (balanceError?.status === 401) {
    checks.push({
      id: "keys",
      label: "API keys",
      status: "error",
      detail: "Exotel rejects the saved API key or token. Update the keys below.",
    });
  } else if (balanceError) {
    checks.push({
      id: "keys",
      label: "Exotel account",
      status: "warn",
      detail: balanceError.message,
    });
  } else {
    checks.push({
      id: "keys",
      label: "API keys",
      status: "ok",
      detail: "Exotel accepts the saved keys.",
    });
  }

  if (balance) {
    const money = formatMoney(balance.amount, balance.currency);
    if (balance.isEmpty) {
      checks.push({
        id: "balance",
        label: "Calling balance",
        status: "error",
        detail: `Balance is ${money}. Calls fail until you recharge your Exotel account.`,
      });
    } else if (balance.isLow) {
      checks.push({
        id: "balance",
        label: "Calling balance",
        status: "warn",
        detail: `Only ${money} left (below ${formatMoney(balance.lowThreshold, balance.currency)}). Recharge soon so calls don't stop.`,
      });
    } else {
      checks.push({
        id: "balance",
        label: "Calling balance",
        status: "ok",
        detail: `${money} available.`,
      });
    }
  }

  checks.push(
    config?.virtualNumber
      ? {
          id: "number",
          label: "Exotel number",
          status: "ok",
          detail: `Guests see calls from ${config.virtualNumber}.`,
        }
      : {
          id: "number",
          label: "Exotel number",
          status: "error",
          detail: "No Exotel virtual number is saved, so calls have no caller ID.",
        },
  );

  return checks;
};

const QUALITY = {
  GREEN: { status: "ok", detail: "Quality rating is high." },
  YELLOW: { status: "warn", detail: "Quality rating is medium. Too many blocks or reports can limit sending." },
  RED: { status: "error", detail: "Quality rating is low. Meta may limit or pause sending from this number." },
};

export const whatsappChecks = (account) => {
  if (!account) return [];
  // Meta / gian answer null (not missing) for parts it couldn't read, e.g. a
  // number still being set up; defaults alone don't cover null
  const onboardingStatus = account.onboardingStatus ?? {};
  const phoneNumber = account.phoneNumber ?? {};
  const business = account.business ?? {};
  const checks = [];

  checks.push(
    onboardingStatus.isPhoneRegistered
      ? { id: "registered", label: "Phone number", status: "ok", detail: "The number is registered with WhatsApp." }
      : {
          id: "registered",
          label: "Phone number",
          status: "error",
          detail: "The number is not registered yet. Finish verification to send and receive messages.",
        },
  );

  checks.push(
    onboardingStatus.isSubscribed
      ? { id: "webhook", label: "Incoming messages", status: "ok", detail: "Guest messages reach the dashboard." }
      : {
          id: "webhook",
          label: "Incoming messages",
          status: "error",
          detail: "The account is not subscribed, so guest messages don't reach the dashboard. Reconnect WhatsApp.",
        },
  );

  const quality = QUALITY[String(phoneNumber.qualityRating || "").toUpperCase()];
  if (quality) checks.push({ id: "quality", label: "Quality rating", ...quality });

  if (phoneNumber.accountMode) {
    const live = String(phoneNumber.accountMode).toUpperCase() === "LIVE";
    checks.push({
      id: "mode",
      label: "Account mode",
      status: live ? "ok" : "warn",
      detail: live ? "Live: messages go to real guests." : `${phoneNumber.accountMode}: only test numbers get messages.`,
    });
  }

  const nameStatus = String(phoneNumber.nameStatus || "").toUpperCase();
  if (nameStatus) {
    checks.push({
      id: "name",
      label: "Display name",
      status: nameStatus === "APPROVED" ? "ok" : nameStatus.includes("DECLINED") ? "error" : "warn",
      detail:
        nameStatus === "APPROVED"
          ? `"${phoneNumber.verifiedName || "Your name"}" is approved.`
          : `Meta's review of the display name: ${nameStatus.toLowerCase().replace(/_/g, " ")}.`,
    });
  }

  const verified = String(business.verificationStatus || "").toLowerCase() === "verified";
  checks.push({
    id: "business",
    label: "Business verification",
    status: verified ? "ok" : "warn",
    detail: verified
      ? "Meta has verified your business."
      : "Not verified by Meta yet. Daily sending limits stay low until it is.",
  });

  return checks;
};

// the hotel's own mailbox for campaign emails (gian sender-mailbox);
// ses = its own address in Amazon SES, used instead when verified
export const senderMailboxChecks = (mailbox, ses = null) => {
  if (ses) {
    const where = ses.kind === "domain" ? ses.identity : ses.fromEmail;
    const amazon =
      ses.status === "verified"
        ? { id: "amazon", label: "Amazon sending", status: "ok", detail: `Emails go out fast through Amazon from ${ses.fromEmail}.` }
        : ses.status === "failed"
          ? { id: "amazon", label: "Amazon sending", status: "error", detail: ses.lastError || `Amazon could not verify ${where}.` }
          : {
              id: "amazon",
              label: "Amazon sending",
              status: "warn",
              detail:
                ses.kind === "domain"
                  ? `Waiting for Amazon to verify ${where}. Add the DNS records shown in Manage.`
                  : `Waiting for the verification link Amazon sent to ${where} to be clicked.`,
            };
    // verified: the mail server isn't used, so its checks don't matter
    if (ses.status === "verified" || !mailbox) return [amazon];
    return [amazon, ...senderMailboxChecks(mailbox)];
  }
  if (!mailbox) return [];
  const checks = [
    mailbox.status === "error"
      ? {
          id: "login",
          label: "Mailbox login",
          status: "error",
          detail: mailbox.lastError || "Your mail server refused the login. Update the password to keep sending.",
        }
      : {
          id: "login",
          label: "Mailbox login",
          status: "ok",
          detail: `Emails go out from ${mailbox.email}.`,
        },
  ];

  if (mailbox.providerSavesSent) {
    checks.push({ id: "sent", label: "Sent folder", status: "ok", detail: "Your provider files every sent email in Sent by itself." });
  } else if (!mailbox.saveToSent) {
    checks.push({ id: "sent", label: "Sent folder", status: "info", detail: "Copies are not saved to your Sent folder." });
  } else if (mailbox.lastSentCopyError) {
    checks.push({ id: "sent", label: "Sent folder", status: "warn", detail: `The last copy couldn't be saved: ${mailbox.lastSentCopyError}` });
  } else {
    checks.push({ id: "sent", label: "Sent folder", status: "ok", detail: `A copy of every email is saved to "${mailbox.sentFolder || "Sent"}".` });
  }
  return checks;
};

// Where an app stands, from best to worst news:
//   connected | warn | error   - connected (warn/error: a health check failed)
//   available | locked | soon  - not connected
export const appState = (app, integrations) => {
  if (app.comingSoon) return "soon";
  if (integrations.isLocked(app)) return "locked";
  if (!integrations.isConnected(app)) return "available";
  const problem = headlineCheck(integrations.health[app.id]?.checks);
  return problem ? problem.status : "connected";
};

export const isConnectedState = (state) => ["connected", "warn", "error"].includes(state);
