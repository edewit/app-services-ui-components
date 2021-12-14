import React from 'react';
import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { QuotaValue,Quota } from "@rhoas/app-services-ui-shared";


export type QuotaAlertProps = {
  quota: Quota | undefined;
  hasKafkaCreationFailed?:boolean
  userHasTrialInstance?:boolean,
  kasTrial?:QuotaValue,
  kasQuota?:QuotaValue
};


export const QuotaAlert: React.FC<QuotaAlertProps> = ({
  quota,
  hasKafkaCreationFailed,
  userHasTrialInstance,
  kasTrial,
  kasQuota
}) => {
  const { t } = useTranslation();

  if (quota === undefined || quota.loading) {
    return (
      <Alert
        id='mk-create-instance-quota-alert'
        className='pf-u-mb-md'
        variant={AlertVariant.info}
        title={t('instance_checking_message')}
        aria-live='polite'
        isInline
        customIcon={
          <Spinner size='md' aria-valuetext='Checking kafka availability' />
        }
      />
    );
  }
  type QuotaAlertProps = {
    titleKey: string;
    messageKey: string;
    variant: AlertVariant;
  };

  const getQuotaAlertProps = (): QuotaAlertProps | undefined => {

    //if kafka creation failed for quota related
    if (hasKafkaCreationFailed) {
      return {
        variant: AlertVariant.danger,
        titleKey: 'kafka_creation_failed_alert_title',
        messageKey: kasQuota
          ? 'standard_kafka_creation_failed_alert_message'
          : 'trial_kafka_creation_failed_alert_message',
      };
    }

    //if service down or any error
    if (quota.isServiceDown) {
      return {
        titleKey: 'something_went_wrong',
        variant: AlertVariant.danger,
        messageKey: 'ams_service_down_message',
      };
    }

    //trial quota flows
    //if user has no standard quota and already has a trial instance
    if (!kasQuota && kasTrial && userHasTrialInstance) {
      return {
        titleKey: 'trial_kafka_title',
        variant: AlertVariant.warning,
        messageKey: 'deploy_one_instance_alert_message',
      };
    }
    //if user has no standard quota and no trial quota
    if (!kasQuota && !kasTrial) {
      return {
        variant: AlertVariant.warning,
        titleKey: 'no_quota_kafka_alert_title',
        messageKey: 'no_quota_kafka_alert_message',
      };
    }
    //if user has no standard quota and trial instances are available
    if (!kasQuota && kasTrial && !userHasTrialInstance) {
      return {
        variant: AlertVariant.info,
        titleKey: 'trial_quota_kafka_title',
        messageKey: '',
      };
    }

    //standard quota flows
    //if user has standard quota but all allowed instances are already provisioned
    if (kasQuota && kasQuota?.remaining === 0) {
      return {
        variant: AlertVariant.warning,
        titleKey: 'standard_kafka_alert_title',
        messageKey: 'standard_kafka_alert_message',
      };
    }
    return undefined;
  };

  const alertProps = getQuotaAlertProps();

  if (alertProps === undefined) {
    return <></>;
  }

  return (
    <Alert
      id='mk-create-instance-quota-alert'
      className='pf-u-mb-md'
      variant={alertProps.variant}
      title={t(alertProps.titleKey)}
      aria-live='polite'
      isInline
    >
      {t(alertProps.messageKey)}
    </Alert>
  );
};
