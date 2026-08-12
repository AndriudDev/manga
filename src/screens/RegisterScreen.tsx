import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { AuthController } from '../controllers/AuthController';

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

interface RegisterScreenProps {
  onBackToLogin: () => void;
  onRegisterSuccess: () => void;
}

export default function RegisterScreen({
  onBackToLogin,
  onRegisterSuccess,
}: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): RegisterErrors => {
    const newErrors: RegisterErrors = {};
    if (name.trim() === '') {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (email.trim() === '') {
      newErrors.email = 'El correo es obligatorio';
    }
    if (password.trim() === '') {
      newErrors.password = 'La contraseña es obligatoria';
    }
    if (confirm.trim() === '') {
      newErrors.confirm = 'Confirma la contraseña';
    } else if (password !== confirm) {
      newErrors.confirm = 'Las contraseñas no coinciden';
    }
    return newErrors;
  };

  const clearError = (field: keyof RegisterErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setFormError(undefined);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await AuthController.register({ name, email, password });
    setIsSubmitting(false);

    if (!result.ok) {
      const fieldError = result.error === 'Ya existe una cuenta con este correo' ? 'email' : undefined;
      if (fieldError) {
        setErrors((prev) => ({ ...prev, [fieldError]: result.error }));
      } else {
        setFormError(result.error);
      }
      return;
    }
    setIsRegistered(true);
  };

  // Estado de éxito
  if (isRegistered) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={56} color={Colors.textPrimary} />
          </View>
          <Text style={styles.successTitle}>¡Cuenta creada!</Text>
          <Text style={styles.successSubtitle}>
            Registro exitoso, bienvenido a MangaTools.
          </Text>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={onRegisterSuccess}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="person-add" size={36} color={Colors.accentPrimary} />
        </View>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para empezar</Text>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        {formError ? (
          <View style={styles.formErrorBox}>
            <Ionicons name="alert-circle" size={18} color={Colors.error} />
            <Text style={styles.formErrorText}>{formError}</Text>
          </View>
        ) : null}

        {/* Campo nombre */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.name && styles.inputWrapperError,
            ]}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={errors.name ? Colors.error : Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              placeholderTextColor={Colors.textSecondary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearError('name');
              }}
              autoCapitalize="words"
            />
          </View>
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : null}
        </View>

        {/* Campo correo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.email && styles.inputWrapperError,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={errors.email ? Colors.error : Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="usuario@correo.com"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError('email');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Campo contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.password && styles.inputWrapperError,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={errors.password ? Colors.error : Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError('password');
                setErrors((prev) => ({ ...prev, confirm: undefined }));
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
        </View>

        {/* Campo confirmar contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.confirm && styles.inputWrapperError,
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={errors.confirm ? Colors.error : Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Repite la contraseña"
              placeholderTextColor={Colors.textSecondary}
              value={confirm}
              onChangeText={(text) => {
                setConfirm(text);
                clearError('confirm');
              }}
              secureTextEntry={!showPassword}
            />
          </View>
          {errors.confirm ? (
            <Text style={styles.errorText}>{errors.confirm}</Text>
          ) : null}
        </View>

        {/* Botón registrarse */}
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.textPrimary} size="small" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        {/* Enlace a login */}
        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={onBackToLogin} activeOpacity={0.7}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Encabezado
  header: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },

  // Formulario
  form: {
    gap: 20,
  },
  formErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: Colors.borderError,
    borderRadius: 12,
    padding: 12,
  },
  formErrorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperError: {
    borderColor: Colors.borderError,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    height: '100%',
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginLeft: 4,
  },

  // Botón
  button: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },

  // Login
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  loginPrompt: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.accentPrimary,
  },

  // Éxito
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
