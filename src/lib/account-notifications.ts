export const ACCOUNT_NOTIFICATION_CHANNELS = [
  "desktop",
  "mobile",
  "email",
  "slack",
] as const;

export const ACCOUNT_NOTIFICATION_EVENTS = [
  "assignments",
  "statusChanges",
  "mentions",
  "comments",
] as const;

export type AccountNotificationChannelKey =
  (typeof ACCOUNT_NOTIFICATION_CHANNELS)[number];
export type AccountNotificationEventKey =
  (typeof ACCOUNT_NOTIFICATION_EVENTS)[number];

export type NotificationEventPreferences = Record<
  AccountNotificationEventKey,
  boolean
>;

export type NotificationChannelPreferences = {
  events: NotificationEventPreferences;
};

export type AccountNotificationSettings = {
  channels: Record<
    AccountNotificationChannelKey,
    NotificationChannelPreferences
  >;
  updatesFromLinear: {
    showInSidebar: boolean;
    newsletter: boolean;
    marketing: boolean;
  };
  other: {
    inviteAccepted: boolean;
    privacyAndLegalUpdates: boolean;
    dpa: boolean;
  };
};

export type NotificationChannelPreferencesPatch = {
  events?: Partial<NotificationEventPreferences>;
};

export type AccountNotificationSettingsPatch = {
  channels?: Partial<
    Record<AccountNotificationChannelKey, NotificationChannelPreferencesPatch>
  >;
  updatesFromLinear?: Partial<AccountNotificationSettings["updatesFromLinear"]>;
  other?: Partial<AccountNotificationSettings["other"]>;
};

export const ACCOUNT_NOTIFICATION_EVENT_LABELS: Record<
  AccountNotificationEventKey,
  string
> = {
  assignments: "Assignments",
  statusChanges: "Status changes",
  mentions: "Mentions",
  comments: "Comments and replies",
};

export const DEFAULT_ACCOUNT_NOTIFICATION_SETTINGS: AccountNotificationSettings =
  {
    channels: {
      desktop: {
        events: {
          assignments: true,
          statusChanges: true,
          mentions: true,
          comments: false,
        },
      },
      mobile: {
        events: {
          assignments: true,
          statusChanges: true,
          mentions: true,
          comments: true,
        },
      },
      email: {
        events: {
          assignments: false,
          statusChanges: false,
          mentions: false,
          comments: false,
        },
      },
      slack: {
        events: {
          assignments: false,
          statusChanges: false,
          mentions: false,
          comments: false,
        },
      },
    },
    updatesFromLinear: {
      showInSidebar: true,
      newsletter: false,
      marketing: false,
    },
    other: {
      inviteAccepted: true,
      privacyAndLegalUpdates: true,
      dpa: false,
    },
  };

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeEventPreferences(
  value: unknown,
  channel: AccountNotificationChannelKey,
) {
  const parsed = asRecord(value);
  const defaults =
    DEFAULT_ACCOUNT_NOTIFICATION_SETTINGS.channels[channel].events;

  return {
    assignments:
      typeof parsed.assignments === "boolean"
        ? parsed.assignments
        : defaults.assignments,
    statusChanges:
      typeof parsed.statusChanges === "boolean"
        ? parsed.statusChanges
        : defaults.statusChanges,
    mentions:
      typeof parsed.mentions === "boolean"
        ? parsed.mentions
        : defaults.mentions,
    comments:
      typeof parsed.comments === "boolean"
        ? parsed.comments
        : defaults.comments,
  };
}

export function normalizeAccountNotificationSettings(
  value: unknown,
): AccountNotificationSettings {
  const parsed = asRecord(value);
  const channels = asRecord(parsed.channels);
  const updatesFromLinear = asRecord(parsed.updatesFromLinear);
  const other = asRecord(parsed.other);

  return {
    channels: {
      desktop: {
        events: normalizeEventPreferences(
          asRecord(channels.desktop).events,
          "desktop",
        ),
      },
      mobile: {
        events: normalizeEventPreferences(
          asRecord(channels.mobile).events,
          "mobile",
        ),
      },
      email: {
        events: normalizeEventPreferences(
          asRecord(channels.email).events,
          "email",
        ),
      },
      slack: {
        events: normalizeEventPreferences(
          asRecord(channels.slack).events,
          "slack",
        ),
      },
    },
    updatesFromLinear: {
      showInSidebar:
        typeof updatesFromLinear.showInSidebar === "boolean"
          ? updatesFromLinear.showInSidebar
          : DEFAULT_ACCOUNT_NOTIFICATION_SETTINGS.updatesFromLinear
              .showInSidebar,
      newsletter:
        typeof updatesFromLinear.newsletter === "boolean"
          ? updatesFromLinear.newsletter
          : DEFAULT_ACCOUNT_NOTIFICATION_SETTINGS.updatesFromLinear.newsletter,
      marketing:
        typeof updatesFromLinear.marketing === "boolean"
          ? updatesFromLinear.marketing
          : DEFAULT_ACCOUNT_NOTIFICATION_SETTINGS.updatesFromLinear.marketing,
    },
    other: {
      inviteAccepted:
        typeof other.inviteAccepted === "boolean"
          ? other.inviteAccepted
          : DEFAULT_ACCOUNT_NOTIFICATION_SETTINGS.other.inviteAccepted,
      privacyAndLegalUpdates:
        typeof other.privacyAndLegalUpdates === "boolean"
          ? other.privacyAndLegalUpdates
          : DEFAULT_ACCOUNT_NOTIFICATION_SETTINGS.other.privacyAndLegalUpdates,
      dpa:
        typeof other.dpa === "boolean"
          ? other.dpa
          : DEFAULT_ACCOUNT_NOTIFICATION_SETTINGS.other.dpa,
    },
  };
}

export function mergeAccountNotificationSettings(
  current: AccountNotificationSettings,
  patch: AccountNotificationSettingsPatch,
): AccountNotificationSettings {
  return normalizeAccountNotificationSettings({
    ...current,
    ...patch,
    channels: {
      ...current.channels,
      ...patch.channels,
      desktop: {
        ...current.channels.desktop,
        ...patch.channels?.desktop,
        events: {
          ...current.channels.desktop.events,
          ...patch.channels?.desktop?.events,
        },
      },
      mobile: {
        ...current.channels.mobile,
        ...patch.channels?.mobile,
        events: {
          ...current.channels.mobile.events,
          ...patch.channels?.mobile?.events,
        },
      },
      email: {
        ...current.channels.email,
        ...patch.channels?.email,
        events: {
          ...current.channels.email.events,
          ...patch.channels?.email?.events,
        },
      },
      slack: {
        ...current.channels.slack,
        ...patch.channels?.slack,
        events: {
          ...current.channels.slack.events,
          ...patch.channels?.slack?.events,
        },
      },
    },
    updatesFromLinear: {
      ...current.updatesFromLinear,
      ...patch.updatesFromLinear,
    },
    other: {
      ...current.other,
      ...patch.other,
    },
  });
}

export function readAccountNotificationsFromUserSettings(settings: unknown) {
  return normalizeAccountNotificationSettings(
    asRecord(settings).accountNotifications,
  );
}

export function writeAccountNotificationsToUserSettings(
  settings: unknown,
  accountNotifications: AccountNotificationSettings,
) {
  const parsed = asRecord(settings);

  return {
    ...parsed,
    accountNotifications,
  };
}

export function isAccountNotificationChannelKey(
  value: string,
): value is AccountNotificationChannelKey {
  return ACCOUNT_NOTIFICATION_CHANNELS.includes(
    value as AccountNotificationChannelKey,
  );
}

export function countEnabledNotificationEvents(
  channelPreferences: NotificationChannelPreferences,
) {
  return ACCOUNT_NOTIFICATION_EVENTS.filter(
    (eventKey) => channelPreferences.events[eventKey],
  ).length;
}

export function describeNotificationChannelPreferences(
  channelPreferences: NotificationChannelPreferences,
) {
  const enabledLabels = ACCOUNT_NOTIFICATION_EVENTS.filter(
    (eventKey) => channelPreferences.events[eventKey],
  ).map((eventKey) =>
    ACCOUNT_NOTIFICATION_EVENT_LABELS[eventKey].toLowerCase(),
  );

  if (enabledLabels.length === 0) {
    return "Disabled";
  }

  if (enabledLabels.length === ACCOUNT_NOTIFICATION_EVENTS.length) {
    return "Enabled for all notifications";
  }

  if (enabledLabels.length === 1) {
    return `Enabled for ${enabledLabels[0]}`;
  }

  if (enabledLabels.length === 2) {
    return `Enabled for ${enabledLabels[0]} and ${enabledLabels[1]}`;
  }

  const remainingCount = enabledLabels.length - 2;
  const remainingLabel = remainingCount === 1 ? "other" : "others";

  return `Enabled for ${enabledLabels[0]}, ${enabledLabels[1]}, and ${remainingCount} ${remainingLabel}`;
}
